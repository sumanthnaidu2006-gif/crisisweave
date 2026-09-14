package com.crisisweave.repository;

import com.crisisweave.model.StoredAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StoredAlertRepository extends JpaRepository<StoredAlert, String> {
}
