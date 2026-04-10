package com.patientcare.repository;

import com.patientcare.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.username = :identifier OR u.email = :identifier")
    Optional<User> findByUsernameOrEmail(@Param("identifier") String username,
                                          @Param("identifier") String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    // Use JOIN FETCH to avoid N+1 on department
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.department WHERE u.role = :role AND u.active = true")
    List<User> findActiveByRole(@Param("role") User.Role role);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.department WHERE u.department.id = :deptId AND u.active = true")
    List<User> findActiveByDepartment(@Param("deptId") Long departmentId);
}
