package com.verideed.backend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.verideed.backend.model.Deed;
import com.verideed.backend.model.ForensicReport;
import com.verideed.backend.model.Property;
import com.verideed.backend.repository.DeedRepository;
import com.verideed.backend.repository.ForensicReportRepository;
import com.verideed.backend.repository.PropertyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.geom.Polygon;
import org.locationtech.jts.io.WKTReader;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.OffsetDateTime;
import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class DeedController {

    private final DeedRepository deedRepository;
    private final PropertyRepository propertyRepository;
    private final ForensicReportRepository forensicReportRepository;
    private final ObjectMapper objectMapper;

    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    private static final String UPLOAD_DIR = "uploads";

    @PostMapping("/deeds/upload")
    public ResponseEntity<?> uploadDeed(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Please upload a file"));
        }

        try {
            // Ensure uploads directory exists
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Save file locally
            String originalFilename = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String deedId = "DEED-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            String savedFilename = deedId + fileExtension;
            Path filePath = uploadPath.resolve(savedFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            log.info("Saved uploaded deed to: {}", filePath.toAbsolutePath());

            // Call FastAPI AI service
            JsonNode aiResponse = callAiService(file, originalFilename);
            if (aiResponse == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "AI service failed to process document"));
            }

            // Extract values from AI service response
            String ownerName = aiResponse.path("owner_name").asText("Unknown Owner");
            String surveyNumber = aiResponse.path("survey_number").asText("TS-UNKNOWN");
            double area = aiResponse.path("area").asDouble(2000.0);
            String wktPolygon = aiResponse.path("wkt_polygon").asText();
            double ocrScore = aiResponse.path("ocr_score").asDouble(90.0);
            double layoutScore = aiResponse.path("layout_score").asDouble(90.0);

            // Validate that we can parse JTS Geometry from WKT
            WKTReader reader = new WKTReader();
            Geometry geometry;
            try {
                geometry = reader.read(wktPolygon);
                if (!(geometry instanceof Polygon)) {
                    throw new Exception("Parsed geometry is not a Polygon");
                }
            } catch (Exception ex) {
                log.error("Failed to parse WKT Polygon: {}", wktPolygon, ex);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "AI returned invalid spatial coordinates: " + ex.getMessage()));
            }

            // 1. Save Deed
            Deed deed = Deed.builder()
                    .id(deedId)
                    .ownerName(ownerName)
                    .surveyNumber(surveyNumber)
                    .documentPath(filePath.toString())
                    .createdAt(OffsetDateTime.now())
                    .build();
            deedRepository.save(deed);

            // 2. Save Property Spatial Record (WKT saved in TEXT column)
            Property property = Property.builder()
                    .deedId(deedId)
                    .geometryWkt(wktPolygon)
                    .area(area)
                    .location(surveyNumber + ", Madhapur, Hyderabad, Telangana")
                    .build();
            propertyRepository.save(property);

            // 3. Perform Spatial Overlap Checks in Java (to avoid PostGIS requirements)
            List<Property> allRegistered = propertyRepository.findAll();
            double maxOverlapPercentage = 0.0;
            List<Map<String, Object>> overlapDetailsList = new ArrayList<>();

            for (Property p : allRegistered) {
                if (p.getDeedId().equals(deedId)) {
                    continue; // Skip current upload
                }

                try {
                    Geometry otherGeom = reader.read(p.getGeometryWkt());
                    if (geometry.intersects(otherGeom)) {
                        Geometry intersection = geometry.intersection(otherGeom);
                        double overlapPct = (intersection.getArea() / geometry.getArea()) * 100.0;
                        maxOverlapPercentage = Math.max(maxOverlapPercentage, overlapPct);

                        // Fetch overlapping deed details
                        Optional<Deed> overlapDeedOpt = deedRepository.findById(p.getDeedId());
                        String overlapOwner = overlapDeedOpt.map(Deed::getOwnerName).orElse("Unknown Owner");

                        overlapDetailsList.add(Map.of(
                                "deed_id", p.getDeedId(),
                                "owner_name", overlapOwner,
                                "overlap_percentage", Math.round(overlapPct * 100.0) / 100.0
                        ));
                    }
                } catch (Exception ex) {
                    log.error("Failed to parse or calculate overlap with property: {}", p.getDeedId(), ex);
                }
            }

            // 4. Perform Ownership Check (Survey Number Mismatch / Multi-Claim Check)
            double ownershipConflictScore = 0.0;
            List<Deed> sameSurveyDeeds = deedRepository.findAll().stream()
                    .filter(d -> d.getSurveyNumber().equalsIgnoreCase(surveyNumber) && !d.getId().equals(deedId))
                    .toList();

            List<String> ownershipIssues = new ArrayList<>();
            for (Deed d : sameSurveyDeeds) {
                if (!d.getOwnerName().equalsIgnoreCase(ownerName)) {
                    ownershipConflictScore = 100.0;
                    ownershipIssues.add("Ownership conflict: Survey number " + surveyNumber +
                            " is already registered to '" + d.getOwnerName() + "' (Deed: " + d.getId() + ")");
                }
            }

            // 5. Calculate Final Risk Score
            double layoutRisk = 100.0 - layoutScore;
            double overlapRisk = Math.min(100.0, maxOverlapPercentage);
            double finalRisk = (0.4 * layoutRisk) + (0.4 * overlapRisk) + (0.2 * ownershipConflictScore);
            finalRisk = Math.round(finalRisk * 100.0) / 100.0;

            // 6. Build report details JSON
            ObjectNode detailsJson = objectMapper.createObjectNode();
            
            // Layout Analysis details
            ObjectNode layoutDetails = objectMapper.createObjectNode();
            layoutDetails.put("score", layoutScore);
            layoutDetails.put("status", aiResponse.path("layout_status").asText());
            ArrayNode aiIssues = (ArrayNode) aiResponse.path("layout_issues");
            layoutDetails.set("issues", aiIssues);
            layoutDetails.set("suspicious_regions", aiResponse.path("suspicious_regions"));
            detailsJson.set("layout_analysis", layoutDetails);

            // Spatial analysis details
            ObjectNode spatialDetails = objectMapper.createObjectNode();
            spatialDetails.put("overlap_score", overlapRisk);
            spatialDetails.put("max_overlap_percentage", Math.round(maxOverlapPercentage * 100.0) / 100.0);
            spatialDetails.set("overlaps", objectMapper.valueToTree(overlapDetailsList));
            spatialDetails.set("coordinates", aiResponse.path("frontend_coords"));
            detailsJson.set("spatial_analysis", spatialDetails);

            // Ownership analysis details
            ObjectNode ownershipDetails = objectMapper.createObjectNode();
            ownershipDetails.put("conflict_score", ownershipConflictScore);
            ownershipDetails.set("issues", objectMapper.valueToTree(ownershipIssues));
            detailsJson.set("ownership_analysis", ownershipDetails);

            // 7. Save Forensic Report
            ForensicReport report = ForensicReport.builder()
                    .deedId(deedId)
                    .ocrScore(ocrScore)
                    .layoutScore(layoutScore)
                    .overlapScore(overlapRisk)
                    .finalRisk(finalRisk)
                    .details(detailsJson.toString())
                    .build();
            forensicReportRepository.save(report);

            log.info("Analysis completed for {}. Final Risk Score: {}", deedId, finalRisk);

            return ResponseEntity.ok(Map.of(
                    "id", deedId,
                    "status", "COMPLETED",
                    "risk", finalRisk
            ));

        } catch (Exception e) {
            log.error("Deed upload and processing failed", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Deed verification failed: " + e.getMessage()));
        }
    }

    @GetMapping("/deeds/{id}/report")
    public ResponseEntity<?> getReport(@PathVariable("id") String id) {
        Optional<Deed> deedOpt = deedRepository.findById(id);
        if (deedOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Deed not found"));
        }

        Deed deed = deedOpt.get();
        Optional<ForensicReport> reportOpt = forensicReportRepository.findByDeedId(id);
        Optional<Property> propertyOpt = propertyRepository.findByDeedId(id);

        if (reportOpt.isEmpty() || propertyOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                    "id", deed.getId(),
                    "owner_name", deed.getOwnerName(),
                    "survey_number", deed.getSurveyNumber(),
                    "status", "PROCESSING"
                ));
        }

        ForensicReport report = reportOpt.get();
        Property property = propertyOpt.get();

        try {
            JsonNode details = objectMapper.readTree(report.getDetails());
            
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("id", deed.getId());
            response.put("owner_name", deed.getOwnerName());
            response.put("survey_number", deed.getSurveyNumber());
            response.put("created_at", deed.getCreatedAt());
            response.put("area", property.getArea());
            response.put("location", property.getLocation());
            response.put("ocr_score", report.getOcrScore());
            response.put("layout_score", report.getLayoutScore());
            response.put("overlap_score", report.getOverlapScore());
            response.put("final_risk", report.getFinalRisk());
            response.put("details", details);

            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to deserialize report details"));
        }
    }

    @GetMapping("/properties")
    public ResponseEntity<?> getAllProperties() {
        List<Property> properties = propertyRepository.findAll();
        List<Map<String, Object>> responseList = new ArrayList<>();
        WKTReader reader = new WKTReader();

        for (Property p : properties) {
            Optional<Deed> deedOpt = deedRepository.findById(p.getDeedId());
            if (deedOpt.isEmpty()) continue;
            Deed d = deedOpt.get();

            Optional<ForensicReport> reportOpt = forensicReportRepository.findByDeedId(p.getDeedId());
            double risk = reportOpt.map(ForensicReport::getFinalRisk).orElse(0.0);

            List<double[]> coords = new ArrayList<>();
            try {
                Geometry geom = reader.read(p.getGeometryWkt());
                for (org.locationtech.jts.geom.Coordinate c : geom.getCoordinates()) {
                    coords.add(new double[]{c.y, c.x}); // [lat, lon]
                }
            } catch (Exception ex) {
                log.error("Failed to parse polygon for property map view: {}", p.getDeedId(), ex);
            }

            responseList.add(Map.of(
                    "deed_id", p.getDeedId(),
                    "owner_name", d.getOwnerName(),
                    "survey_number", d.getSurveyNumber(),
                    "area", p.getArea(),
                    "location", p.getLocation(),
                    "coordinates", coords,
                    "risk", risk
            ));
        }

        return ResponseEntity.ok(responseList);
    }

    private JsonNode callAiService(MultipartFile file, String filename) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            // Pack the file as resource
            ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return filename;
                }
            };

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", fileResource);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            String url = aiServiceUrl + "/analyze";

            log.info("Sending document to AI service at: {}", url);
            ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                return objectMapper.readTree(response.getBody());
            } else {
                log.error("AI service returned code: {}", response.getStatusCode());
                return null;
            }
        } catch (Exception e) {
            log.error("Exception calling AI service", e);
            return null;
        }
    }
}
