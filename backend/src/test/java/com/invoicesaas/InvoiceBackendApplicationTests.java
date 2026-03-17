package com.invoicesaas;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
    "spring.data.mongodb.uri=mongodb://localhost:27017/invoicesaas_test",
    "app.jwt.secret=TestSecretKeyThatIsAtLeast256BitsLongForHS256AlgorithmTest",
    "spring.mail.host=localhost",
    "spring.mail.port=1025"
})
class InvoiceBackendApplicationTests {

    @Test
    void contextLoads() {
        // Verify Spring context loads correctly
    }
}
