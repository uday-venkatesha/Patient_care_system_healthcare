package com.patientcare.repository;

import com.patientcare.model.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    Optional<Patient> findByMedicalRecordNumber(String mrn);

    boolean existsByMedicalRecordNumber(String mrn);

    // Eager-fetch associations to prevent N+1 on list queries.
    // countQuery is explicit to avoid Hibernate 6 / Spring Data JPA 3.x issues
    // deriving COUNT(DISTINCT p) from a JOIN FETCH query.
    @Query(value = """
        SELECT p FROM Patient p
        LEFT JOIN FETCH p.department
        LEFT JOIN FETCH p.primaryDoctor
        WHERE (:status IS NULL OR p.status = :status)
          AND (:deptId IS NULL OR p.department.id = :deptId)
          AND (:search IS NULL
               OR LOWER(p.firstName) LIKE LOWER(CONCAT('%',:search,'%'))
               OR LOWER(p.lastName) LIKE LOWER(CONCAT('%',:search,'%'))
               OR p.medicalRecordNumber LIKE CONCAT('%',:search,'%'))
        """,
        countQuery = """
        SELECT COUNT(p) FROM Patient p
        WHERE (:status IS NULL OR p.status = :status)
          AND (:deptId IS NULL OR p.department.id = :deptId)
          AND (:search IS NULL
               OR LOWER(p.firstName) LIKE LOWER(CONCAT('%',:search,'%'))
               OR LOWER(p.lastName) LIKE LOWER(CONCAT('%',:search,'%'))
               OR p.medicalRecordNumber LIKE CONCAT('%',:search,'%'))
        """)
    Page<Patient> searchPatients(
            @Param("status") Patient.AdmissionStatus status,
            @Param("deptId") Long departmentId,
            @Param("search") String search,
            Pageable pageable);

    @Query("SELECT p FROM Patient p LEFT JOIN FETCH p.department LEFT JOIN FETCH p.primaryDoctor WHERE p.id = :id")
    Optional<Patient> findByIdWithDetails(@Param("id") Long id);

    long countByStatus(Patient.AdmissionStatus status);
}
