package com.patientcare.service;

import com.patientcare.dto.CarePlanDto;
import com.patientcare.exception.ResourceNotFoundException;
import com.patientcare.model.AuditLog;
import com.patientcare.model.CarePlan;
import com.patientcare.model.Patient;
import com.patientcare.model.User;
import com.patientcare.repository.CarePlanRepository;
import com.patientcare.repository.PatientRepository;
import com.patientcare.repository.UserRepository;
import com.patientcare.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CarePlanService {

    private final CarePlanRepository carePlanRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<CarePlanDto.Response> getCarePlansByPatient(Long patientId) {
        return carePlanRepository.findByPatientIdWithDetails(patientId)
                .stream()
                .map(CarePlanDto.Response::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<CarePlanDto.Response> getMyCarePlans(CarePlan.CarePlanStatus status, Pageable pageable) {
        UserDetailsImpl userDetails = getCurrentUser();
        return carePlanRepository
                .findByCoordinatorId(userDetails.getId(), status, pageable)
                .map(CarePlanDto.Response::fromEntity);
    }

    @Transactional(readOnly = true)
    public CarePlanDto.Response getCarePlan(Long id) {
        CarePlan cp = carePlanRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Care plan not found: " + id));

        auditService.log(AuditLog.AuditAction.READ, "CARE_PLAN", id,
                cp.getPatient() != null ? cp.getPatient().getId() : null,
                "Viewed care plan: " + cp.getTitle());

        return CarePlanDto.Response.fromEntity(cp);
    }

    @Transactional
    public CarePlanDto.Response createCarePlan(CarePlanDto.CreateRequest request) {
        UserDetailsImpl currentUser = getCurrentUser();

        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        User createdBy = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        CarePlan.CarePlanBuilder builder = CarePlan.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .goals(request.getGoals())
                .notes(request.getNotes())
                .patient(patient)
                .createdBy(createdBy)
                .priority(request.getPriority() != null ? request.getPriority() : CarePlan.Priority.MEDIUM)
                .status(CarePlan.CarePlanStatus.ACTIVE)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate());

        if (request.getCoordinatorId() != null) {
            User coordinator = userRepository.findById(request.getCoordinatorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Coordinator not found"));
            builder.coordinator(coordinator);
        }

        CarePlan saved = carePlanRepository.save(builder.build());

        auditService.log(AuditLog.AuditAction.CREATE, "CARE_PLAN", saved.getId(),
                patient.getId(), "Created care plan: " + saved.getTitle());

        return CarePlanDto.Response.fromEntity(saved);
    }

    @Transactional
    public CarePlanDto.Response updateCarePlan(Long id, CarePlanDto.UpdateRequest request) {
        CarePlan cp = carePlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Care plan not found: " + id));

        if (request.getTitle() != null) cp.setTitle(request.getTitle());
        if (request.getDescription() != null) cp.setDescription(request.getDescription());
        if (request.getGoals() != null) cp.setGoals(request.getGoals());
        if (request.getNotes() != null) cp.setNotes(request.getNotes());
        if (request.getStatus() != null) cp.setStatus(request.getStatus());
        if (request.getPriority() != null) cp.setPriority(request.getPriority());
        if (request.getStartDate() != null) cp.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) cp.setEndDate(request.getEndDate());

        if (request.getCoordinatorId() != null) {
            User coordinator = userRepository.findById(request.getCoordinatorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Coordinator not found"));
            cp.setCoordinator(coordinator);
        }

        CarePlan saved = carePlanRepository.save(cp);

        auditService.log(AuditLog.AuditAction.UPDATE, "CARE_PLAN", id,
                cp.getPatient() != null ? cp.getPatient().getId() : null,
                "Updated care plan: " + saved.getTitle());

        return CarePlanDto.Response.fromEntity(saved);
    }

    private UserDetailsImpl getCurrentUser() {
        return (UserDetailsImpl) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
    }
}
