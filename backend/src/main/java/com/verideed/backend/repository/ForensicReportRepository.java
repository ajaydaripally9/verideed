package com.verideed.backend.repository;

import com.verideed.backend.model.ForensicReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ForensicReportRepository extends JpaRepository<ForensicReport, UUID> {
    Optional<ForensicReport> findByDeedId(String deedId);
}
