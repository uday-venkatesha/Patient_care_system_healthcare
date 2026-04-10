package com.patientcare.dto;

import com.patientcare.model.Patient;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class PatientDto {

    @Data
    public static class CreateRequest {
        @NotBlank private String firstName;
        @NotBlank private String lastName;
        @NotNull @Past private LocalDate dateOfBirth;
        private Patient.Gender gender;
        private String phoneNumber;
        private String address;
        private String emergencyContactName;
        private String emergencyContactPhone;
        private Long departmentId;
        private Long primaryDoctorId;
        private String allergies;
        private String diagnosis;
        private Patient.AdmissionStatus status;
    }

    @Data
    public static class UpdateRequest {
        private String firstName;
        private String lastName;
        private String phoneNumber;
        private String address;
        private String emergencyContactName;
        private String emergencyContactPhone;
        private Long departmentId;
        private Long primaryDoctorId;
        private String allergies;
        private String diagnosis;
        private Patient.AdmissionStatus status;
    }

    @Data
    public static class Response {
        private Long id;
        private String medicalRecordNumber;
        private String firstName;
        private String lastName;
        private String fullName;
        private LocalDate dateOfBirth;
        private Patient.Gender gender;
        private String phoneNumber;
        private String address;
        private String emergencyContactName;
        private String emergencyContactPhone;
        private Patient.AdmissionStatus status;
        private Long departmentId;
        private String departmentName;
        private Long primaryDoctorId;
        private String primaryDoctorName;
        private String allergies;
        private String diagnosis;
        private LocalDateTime admittedAt;
        private LocalDateTime createdAt;

        public static Response fromEntity(Patient p) {
            Response r = new Response();
            r.setId(p.getId());
            r.setMedicalRecordNumber(p.getMedicalRecordNumber());
            r.setFirstName(p.getFirstName());
            r.setLastName(p.getLastName());
            r.setFullName(p.getFullName());
            r.setDateOfBirth(p.getDateOfBirth());
            r.setGender(p.getGender());
            r.setPhoneNumber(p.getPhoneNumber());
            r.setAddress(p.getAddress());
            r.setEmergencyContactName(p.getEmergencyContactName());
            r.setEmergencyContactPhone(p.getEmergencyContactPhone());
            r.setStatus(p.getStatus());
            r.setAllergies(p.getAllergies());
            r.setDiagnosis(p.getDiagnosis());
            r.setAdmittedAt(p.getAdmittedAt());
            r.setCreatedAt(p.getCreatedAt());
            if (p.getDepartment() != null) {
                r.setDepartmentId(p.getDepartment().getId());
                r.setDepartmentName(p.getDepartment().getName());
            }
            if (p.getPrimaryDoctor() != null) {
                r.setPrimaryDoctorId(p.getPrimaryDoctor().getId());
                r.setPrimaryDoctorName(p.getPrimaryDoctor().getFullName());
            }
            return r;
        }
    }
}
