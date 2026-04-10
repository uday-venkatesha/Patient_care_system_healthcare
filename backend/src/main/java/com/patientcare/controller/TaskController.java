package com.patientcare.controller;

import com.patientcare.dto.TaskDto;
import com.patientcare.model.Task;
import com.patientcare.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping("/my")
    public ResponseEntity<Page<TaskDto.Response>> getMyTasks(
            @RequestParam(required = false) Task.TaskStatus status,
            @PageableDefault(size = 20, sort = "dueDate") Pageable pageable) {
        return ResponseEntity.ok(taskService.getMyTasks(status, pageable));
    }

    @GetMapping("/care-plan/{carePlanId}")
    public ResponseEntity<List<TaskDto.Response>> getTasksByCarePlan(@PathVariable Long carePlanId) {
        return ResponseEntity.ok(taskService.getTasksByCarePlan(carePlanId));
    }

    @PostMapping
    public ResponseEntity<TaskDto.Response> createTask(@Valid @RequestBody TaskDto.CreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.createTask(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskDto.Response> updateTask(
            @PathVariable Long id,
            @RequestBody TaskDto.UpdateRequest request) {
        return ResponseEntity.ok(taskService.updateTask(id, request));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<TaskDto.Response> completeTask(@PathVariable Long id) {
        TaskDto.UpdateRequest req = new TaskDto.UpdateRequest();
        req.setStatus(Task.TaskStatus.COMPLETED);
        return ResponseEntity.ok(taskService.updateTask(id, req));
    }
}
