package com.invoicesaas.controller;

import com.invoicesaas.dto.request.ClientRequest;
import com.invoicesaas.dto.response.ApiResponse;
import com.invoicesaas.model.Client;
import com.invoicesaas.model.User;
import com.invoicesaas.repository.UserRepository;
import com.invoicesaas.service.ClientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
public class ClientController {

    private final ClientService clientService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Client>>> getAllClients(@AuthenticationPrincipal UserDetails userDetails) {
        String tenantId = getTenantId(userDetails);
        return ResponseEntity.ok(ApiResponse.success(clientService.getAllClients(tenantId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Client>> getClient(@PathVariable String id,
                                                          @AuthenticationPrincipal UserDetails userDetails) {
        String tenantId = getTenantId(userDetails);
        return ResponseEntity.ok(ApiResponse.success(clientService.getClientById(id, tenantId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Client>> createClient(@Valid @RequestBody ClientRequest request,
                                                             @AuthenticationPrincipal UserDetails userDetails) {
        String tenantId = getTenantId(userDetails);
        Client client = clientService.createClient(request, tenantId);
        return ResponseEntity.ok(ApiResponse.success("Client created successfully", client));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Client>> updateClient(@PathVariable String id,
                                                             @Valid @RequestBody ClientRequest request,
                                                             @AuthenticationPrincipal UserDetails userDetails) {
        String tenantId = getTenantId(userDetails);
        Client client = clientService.updateClient(id, request, tenantId);
        return ResponseEntity.ok(ApiResponse.success("Client updated successfully", client));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteClient(@PathVariable String id,
                                                           @AuthenticationPrincipal UserDetails userDetails) {
        String tenantId = getTenantId(userDetails);
        clientService.deleteClient(id, tenantId);
        return ResponseEntity.ok(ApiResponse.success("Client deleted successfully", null));
    }

    private String getTenantId(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        return user.getTenantId();
    }
}
