package com.patientcare.dto;

import com.patientcare.model.CarePlan;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

public class CarePlanDto {

    @Data
    public static class CreateRequest {
        @NotBlank private String title;
        private String description;
        private String goals;
        private String notes;
        @NotNull private Long patientId;
        private Long coordinatorId;
        private CarePlan.Priority priority;
        private LocalDateTime startDate;
        private LocalDateTime endDate;
    }

    @Data
    public static class UpdateRequest {
        private String title;
        private String description;
        private String goals;
        private String notes;
        private Long coordinatorId;
        private CarePlan.CarePlanStatus status;
        private CarePlan.Priority priority;
        private LocalDateTime startDate;
        private LocalDateTime endDate;
    }

    @Data
    public static class Response {
        private Long id;
        private String title;
        private String description;
        private String goals;
        private String notes;
        private CarePlan.CarePlanStatus status;
        private CarePlan.Priority priority;
        private Long patientId;
        private String patientName;
        private String patientMrn;
        private Long createdById;
        private String createdByName;
        private Long coordinatorId;
        private String coordinatorName;
        private LocalDateTime startDate;
        private LocalDateTime endDate;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private int totalTasks;
        private int completedTasks;
        private List<TaskDto.Response> tasks;

        public static Response fromEntity(CarePlan cp) {
            Response r = new Response();
            r.setId(cp.getId());
            r.setTitle(cp.getTitle());
            r.setDescription(cp.getDescription());
            r.setGoals(cp.getGoals());
            r.setNotes(cp.getNotes());
            r.setStatus(cp.getStatus());
            r.setPriority(cp.getPriority());
            r.setStartDate(cp.getStartDate());
            r.setEndDate(cp.getEndDate());
            r.setCreatedAt(cp.getCreatedAt());
            r.setUpdatedAt(cp.getUpdatedAt());
            if (cp.getPatient() != null) {
                r.setPatientId(cp.getPatient().getId());
                r.setPatientName(cp.getPatient().getFullName());
                r.setPatientMrn(cp.getPatient().getMedicalRecordNumber());
            }
            if (cp.getCreatedBy() != null) {
                r.setCreatedById(cp.getCreatedBy().getId());
                r.setCreatedByName(cp.getCreatedBy().getFullName());
            }
            if (cp.getCoordinator() != null) {
                r.setCoordinatorId(cp.getCoordinator().getId());
                r.setCoordinatorName(cp.getCoordinator().getFullName());
            }
            return r;
        }
    }
}
