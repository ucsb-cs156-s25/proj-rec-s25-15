package edu.ucsb.cs156.rec;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import edu.ucsb.cs156.rec.services.CurrentUserService;
import edu.ucsb.cs156.rec.services.GrantedAuthoritiesService;
import edu.ucsb.cs156.rec.services.wiremock.WiremockService;
import edu.ucsb.cs156.rec.testconfig.TestConfig;
import org.springframework.test.web.servlet.MvcResult;

import java.io.UnsupportedEncodingException;
import java.util.Map;

@ActiveProfiles("test")
@Import(TestConfig.class)
public abstract class ControllerTestCase {
  @Autowired
  public CurrentUserService currentUserService;

  @Autowired
  public GrantedAuthoritiesService grantedAuthoritiesService;

  @Autowired
  public MockMvc mockMvc;

  @Autowired
  public ObjectMapper mapper;

  @MockBean
  WiremockService mockWiremockService;

  protected Map<String, Object> responseToJson(MvcResult result) throws UnsupportedEncodingException, JsonProcessingException {
    String responseString = result.getResponse().getContentAsString();
    return mapper.readValue(responseString, Map.class);
  }
}
