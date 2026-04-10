package com.patientcare.repository;

import com.patientcare.model.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    // JOIN FETCH assignedTo and carePlan to prevent N+1 in list views.
    // countQuery is explicit; ORDER BY is in the data query only.
    @Query(value = """
        SELECT t FROM Task t
        LEFT JOIN FETCH t.assignedTo
        LEFT JOIN FETCH t.carePlan cp
        LEFT JOIN FETCH cp.patient
        WHERE t.assignedTo.id = :userId
          AND (:status IS NULL OR t.status = :status)
        """,
        countQuery = """
        SELECT COUNT(t) FROM Task t
        WHERE t.assignedTo.id = :userId
          AND (:status IS NULL OR t.status = :status)
        """)
    Page<Task> findByAssignedToId(
            @Param("userId") Long userId,
            @Param("status") Task.TaskStatus status,
            Pageable pageable);

    @Query("""
        SELECT t FROM Task t
        LEFT JOIN FETCH t.assignedTo
        LEFT JOIN FETCH t.createdBy
        WHERE t.carePlan.id = :carePlanId
        ORDER BY t.priority DESC, t.dueDate ASC
        """)
    List<Task> findByCarePlanIdWithDetails(@Param("carePlanId") Long carePlanId);

    // Find overdue tasks for scheduler / alert generation
    @Query("""
        SELECT t FROM Task t
        LEFT JOIN FETCH t.assignedTo
        LEFT JOIN FETCH t.carePlan cp
        LEFT JOIN FETCH cp.patient
        WHERE t.status NOT IN ('COMPLETED', 'CANCELLED')
          AND t.dueDate < :now
        """)
    List<Task> findOverdueTasks(@Param("now") LocalDateTime now);

    long countByAssignedToIdAndStatus(Long userId, Task.TaskStatus status);

    long countByStatus(Task.TaskStatus status);
}
