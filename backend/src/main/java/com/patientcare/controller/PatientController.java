package com.patientcare.controller;

import com.patientcare.dto.PatientDto;
import com.patientcare.model.Patient;
import com.patientcare.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @GetMapping
    public ResponseEntity<Page<PatientDto.Response>> searchPatients(
            @RequestParam(required = false) Patient.AdmissionStatus status,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "lastName") Pageable pageable) {
        return ResponseEntity.ok(patientService.searchPatients(status, departmentId, search, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatientDto.Response> getPatient(@PathVariable Long id) {
        return ResponseEntity.ok(patientService.getPatient(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CARE_COORDINATOR', 'NURSE')")
    public ResponseEntity<PatientDto.Response> createPatient(
            @Valid @RequestBody PatientDto.CreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(patientService.createPatient(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CARE_COORDINATOR', 'NURSE', 'DOCTOR')")
    public ResponseEntity<PatientDto.Response> updatePatient(
            @PathVariable Long id,
            @RequestBody PatientDto.UpdateRequest request) {
        return ResponseEntity.ok(patientService.updatePatient(id, request));
    }
}
