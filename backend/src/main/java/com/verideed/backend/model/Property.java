package com.verideed.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Entity
@Table(name = "properties")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Property {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "deed_id", nullable = false, length = 50)
    private String deedId;

    @Column(name = "geometry_wkt", nullable = false, columnDefinition = "text")
    private String geometryWkt;

    @Column(name = "area", nullable = false)
    private Double area;

    @Column(name = "location", nullable = false, length = 255)
    private String location;
}
