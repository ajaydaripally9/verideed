package com.verideed.backend.repository;

import com.verideed.backend.model.Deed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DeedRepository extends JpaRepository<Deed, String> {
}
