package com.invoicesaas.service;

import com.invoicesaas.dto.request.ClientRequest;
import com.invoicesaas.exception.BadRequestException;
import com.invoicesaas.exception.ResourceNotFoundException;
import com.invoicesaas.model.Client;
import com.invoicesaas.repository.ClientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClientService {

    private final ClientRepository clientRepository;

    public List<Client> getAllClients(String tenantId) {
        return clientRepository.findByTenantIdAndActiveTrue(tenantId);
    }

    public Client getClientById(String id, String tenantId) {
        return clientRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Client", id));
    }

    public Client createClient(ClientRequest request, String tenantId) {
        if (clientRepository.existsByEmailAndTenantId(request.getEmail(), tenantId)) {
            throw new BadRequestException("Client with this email already exists");
        }

        Client client = Client.builder()
                .tenantId(tenantId)
                .name(request.getName())
                .companyName(request.getCompanyName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .country(request.getCountry())
                .zipCode(request.getZipCode())
                .notes(request.getNotes())
                .build();

        return clientRepository.save(client);
    }

    public Client updateClient(String id, ClientRequest request, String tenantId) {
        Client client = getClientById(id, tenantId);

        client.setName(request.getName());
        client.setCompanyName(request.getCompanyName());
        client.setEmail(request.getEmail());
        client.setPhone(request.getPhone());
        client.setAddress(request.getAddress());
        client.setCity(request.getCity());
        client.setState(request.getState());
        client.setCountry(request.getCountry());
        client.setZipCode(request.getZipCode());
        client.setNotes(request.getNotes());

        return clientRepository.save(client);
    }

    public void deleteClient(String id, String tenantId) {
        Client client = getClientById(id, tenantId);
        client.setActive(false);
        clientRepository.save(client);
    }

    public long countClients(String tenantId) {
        return clientRepository.countByTenantIdAndActiveTrue(tenantId);
    }
}
