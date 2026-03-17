package com.invoicesaas.repository;

import com.invoicesaas.model.Client;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClientRepository extends MongoRepository<Client, String> {
    List<Client> findByTenantIdAndActiveTrue(String tenantId);
    Optional<Client> findByIdAndTenantId(String id, String tenantId);
    boolean existsByEmailAndTenantId(String email, String tenantId);
    long countByTenantIdAndActiveTrue(String tenantId);
}
