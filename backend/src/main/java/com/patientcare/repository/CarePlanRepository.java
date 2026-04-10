package com.patientcare.repository;

import com.patientcare.model.CarePlan;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CarePlanRepository extends JpaRepository<CarePlan, Long> {

    // JOIN FETCH patient and createdBy to prevent N+1
    @Query("""
        SELECT cp FROM CarePlan cp
        LEFT JOIN FETCH cp.patient
        LEFT JOIN FETCH cp.createdBy
        LEFT JOIN FETCH cp.coordinator
        WHERE cp.patient.id = :patientId
        ORDER BY cp.createdAt DESC
        """)
    List<CarePlan> findByPatientIdWithDetails(@Param("patientId") Long patientId);

    @Query(value = """
        SELECT cp FROM CarePlan cp
        LEFT JOIN FETCH cp.patient p
        LEFT JOIN FETCH cp.coordinator
        WHERE cp.coordinator.id = :coordinatorId
          AND (:status IS NULL OR cp.status = :status)
        """,
        countQuery = """
        SELECT COUNT(cp) FROM CarePlan cp
        WHERE cp.coordinator.id = :coordinatorId
          AND (:status IS NULL OR cp.status = :status)
        """)
    Page<CarePlan> findByCoordinatorId(
            @Param("coordinatorId") Long coordinatorId,
            @Param("status") CarePlan.CarePlanStatus status,
            Pageable pageable);

    @Query("SELECT cp FROM CarePlan cp LEFT JOIN FETCH cp.patient LEFT JOIN FETCH cp.createdBy LEFT JOIN FETCH cp.coordinator WHERE cp.id = :id")
    Optional<CarePlan> findByIdWithDetails(@Param("id") Long id);

    long countByStatus(CarePlan.CarePlanStatus status);
}
