package com.patientcare.dto;

import com.patientcare.model.Task;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

public class TaskDto {

    @Data
    public static class CreateRequest {
        @NotBlank private String title;
        private String description;
        private String notes;
        @NotNull private Long carePlanId;
        private Long assignedToId;
        @NotNull private Task.TaskType type;
        private Task.Priority priority;
        private LocalDateTime dueDate;
    }

    @Data
    public static class UpdateRequest {
        private String title;
        private String description;
        private String notes;
        private Long assignedToId;
        private Task.TaskStatus status;
        private Task.Priority priority;
        private Task.TaskType type;
        private LocalDateTime dueDate;
    }

    @Data
    public static class Response {
        private Long id;
        private String title;
        private String description;
        private String notes;
        private Task.TaskStatus status;
        private Task.Priority priority;
        private Task.TaskType type;
        private Long carePlanId;
        private String carePlanTitle;
        private Long patientId;
        private String patientName;
        private Long assignedToId;
        private String assignedToName;
        private Long createdById;
        private String createdByName;
        private LocalDateTime dueDate;
        private LocalDateTime completedAt;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static Response fromEntity(Task t) {
            Response r = new Response();
            r.setId(t.getId());
            r.setTitle(t.getTitle());
            r.setDescription(t.getDescription());
            r.setNotes(t.getNotes());
            r.setStatus(t.getStatus());
            r.setPriority(t.getPriority());
            r.setType(t.getType());
            r.setDueDate(t.getDueDate());
            r.setCompletedAt(t.getCompletedAt());
            r.setCreatedAt(t.getCreatedAt());
            r.setUpdatedAt(t.getUpdatedAt());
            if (t.getCarePlan() != null) {
                r.setCarePlanId(t.getCarePlan().getId());
                r.setCarePlanTitle(t.getCarePlan().getTitle());
                if (t.getCarePlan().getPatient() != null) {
                    r.setPatientId(t.getCarePlan().getPatient().getId());
                    r.setPatientName(t.getCarePlan().getPatient().getFullName());
                }
            }
            if (t.getAssignedTo() != null) {
                r.setAssignedToId(t.getAssignedTo().getId());
                r.setAssignedToName(t.getAssignedTo().getFullName());
            }
            if (t.getCreatedBy() != null) {
                r.setCreatedById(t.getCreatedBy().getId());
                r.setCreatedByName(t.getCreatedBy().getFullName());
            }
            return r;
        }
    }
}
