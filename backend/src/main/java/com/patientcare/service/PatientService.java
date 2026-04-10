package com.patientcare.service;

import com.patientcare.dto.PatientDto;
import com.patientcare.exception.ResourceNotFoundException;
import com.patientcare.model.AuditLog;
import com.patientcare.model.Department;
import com.patientcare.model.Patient;
import com.patientcare.model.User;
import com.patientcare.repository.DepartmentRepository;
import com.patientcare.repository.PatientRepository;
import com.patientcare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public Page<PatientDto.Response> searchPatients(Patient.AdmissionStatus status,
                                                    Long departmentId,
                                                    String search,
                                                    Pageable pageable) {
        return patientRepository
                .searchPatients(status, departmentId, search, pageable)
                .map(PatientDto.Response::fromEntity);
    }

    @Transactional(readOnly = true)
    public PatientDto.Response getPatient(Long id) {
        Patient patient = patientRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found: " + id));

        auditService.log(AuditLog.AuditAction.READ, "PATIENT", id, id,
                "Viewed patient record: " + patient.getMedicalRecordNumber());

        return PatientDto.Response.fromEntity(patient);
    }

    @Transactional
    public PatientDto.Response createPatient(PatientDto.CreateRequest request) {
        // Generate MRN
        String mrn = "MRN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Patient patient = Patient.builder()
                .medicalRecordNumber(mrn)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .phoneNumber(request.getPhoneNumber())
                .address(request.getAddress())
                .emergencyContactName(request.getEmergencyContactName())
                .emergencyContactPhone(request.getEmergencyContactPhone())
                .allergies(request.getAllergies())
                .diagnosis(request.getDiagnosis())
                .status(request.getStatus() != null ? request.getStatus() : Patient.AdmissionStatus.ADMITTED)
                .admittedAt(LocalDateTime.now())
                .build();

        if (request.getDepartmentId() != null) {
            Department dept = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
            patient.setDepartment(dept);
        }

        if (request.getPrimaryDoctorId() != null) {
            User doctor = userRepository.findById(request.getPrimaryDoctorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
            patient.setPrimaryDoctor(doctor);
        }

        Patient saved = patientRepository.save(patient);

        auditService.log(AuditLog.AuditAction.CREATE, "PATIENT", saved.getId(), saved.getId(),
                "Created patient: " + saved.getMedicalRecordNumber());

        return PatientDto.Response.fromEntity(saved);
    }

    @Transactional
    public PatientDto.Response updatePatient(Long id, PatientDto.UpdateRequest request) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found: " + id));

        if (request.getFirstName() != null) patient.setFirstName(request.getFirstName());
        if (request.getLastName() != null) patient.setLastName(request.getLastName());
        if (request.getPhoneNumber() != null) patient.setPhoneNumber(request.getPhoneNumber());
        if (request.getAddress() != null) patient.setAddress(request.getAddress());
        if (request.getEmergencyContactName() != null) patient.setEmergencyContactName(request.getEmergencyContactName());
        if (request.getEmergencyContactPhone() != null) patient.setEmergencyContactPhone(request.getEmergencyContactPhone());
        if (request.getAllergies() != null) patient.setAllergies(request.getAllergies());
        if (request.getDiagnosis() != null) patient.setDiagnosis(request.getDiagnosis());

        if (request.getStatus() != null) {
            patient.setStatus(request.getStatus());
            if (request.getStatus() == Patient.AdmissionStatus.DISCHARGED) {
                patient.setDischargedAt(LocalDateTime.now());
            }
        }

        if (request.getDepartmentId() != null) {
            Department dept = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
            patient.setDepartment(dept);
        }

        if (request.getPrimaryDoctorId() != null) {
            User doctor = userRepository.findById(request.getPrimaryDoctorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
            patient.setPrimaryDoctor(doctor);
        }

        Patient saved = patientRepository.save(patient);

        auditService.log(AuditLog.AuditAction.UPDATE, "PATIENT", id, id,
                "Updated patient: " + saved.getMedicalRecordNumber());

        return PatientDto.Response.fromEntity(saved);
    }
}
