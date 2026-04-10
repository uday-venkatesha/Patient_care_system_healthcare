package com.patientcare.controller;

import com.patientcare.dto.CarePlanDto;
import com.patientcare.model.CarePlan;
import com.patientcare.service.CarePlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/care-plans")
@RequiredArgsConstructor
public class CarePlanController {

    private final CarePlanService carePlanService;

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<CarePlanDto.Response>> getPatientCarePlans(@PathVariable Long patientId) {
        return ResponseEntity.ok(carePlanService.getCarePlansByPatient(patientId));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('ADMIN', 'CARE_COORDINATOR')")
    public ResponseEntity<Page<CarePlanDto.Response>> getMyCarePlans(
            @RequestParam(required = false) CarePlan.CarePlanStatus status,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(carePlanService.getMyCarePlans(status, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CarePlanDto.Response> getCarePlan(@PathVariable Long id) {
        return ResponseEntity.ok(carePlanService.getCarePlan(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CARE_COORDINATOR', 'DOCTOR')")
    public ResponseEntity<CarePlanDto.Response> createCarePlan(
            @Valid @RequestBody CarePlanDto.CreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(carePlanService.createCarePlan(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CARE_COORDINATOR', 'DOCTOR')")
    public ResponseEntity<CarePlanDto.Response> updateCarePlan(
            @PathVariable Long id,
            @RequestBody CarePlanDto.UpdateRequest request) {
        return ResponseEntity.ok(carePlanService.updateCarePlan(id, request));
    }
}
