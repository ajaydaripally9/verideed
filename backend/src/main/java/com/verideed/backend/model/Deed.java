package com.verideed.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;

@Entity
@Table(name = "deeds")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Deed {
    @Id
    @Column(length = 50)
    private String id;

    @Column(name = "owner_name", nullable = false, length = 100)
    private String ownerName;

    @Column(name = "survey_number", nullable = false, length = 50)
    private String surveyNumber;

    @Column(name = "document_path", nullable = false, length = 255)
    private String documentPath;

    @Column(name = "created_at", columnDefinition = "TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP")
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();
}
