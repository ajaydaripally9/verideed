package com.verideed.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.util.UUID;

@Entity
@Table(name = "forensic_reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ForensicReport {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "deed_id", nullable = false, length = 50)
    private String deedId;

    @Column(name = "ocr_score", nullable = false)
    private Double ocrScore;

    @Column(name = "layout_score", nullable = false)
    private Double layoutScore;

    @Column(name = "overlap_score", nullable = false)
    private Double overlapScore;

    @Column(name = "final_risk", nullable = false)
    private Double finalRisk;

    @Column(name = "details", nullable = false, columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private String details; // Stores issues, layout checks, etc., as a JSON string
}
