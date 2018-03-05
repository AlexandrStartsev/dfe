package edu.alex;
 
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.Charset;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.script.Bindings;
import javax.script.ScriptContext;
import javax.script.ScriptEngine;
import javax.servlet.ServletContext;
import javax.servlet.ServletRegistration;
import javax.servlet.http.HttpServletRequest;
 
import org.apache.commons.io.IOUtils;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.client.utils.URLEncodedUtils;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.message.BasicNameValuePair;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.aop.target.CommonsPool2TargetSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.ApplicationContext;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.google.gson.GsonBuilder;

import edu.alex.buslogic.ScriptHelper;
 
@RestController
public class DfeController {
	
    @Autowired @Qualifier("js-engine-pool") CommonsPool2TargetSource engines;
    @Autowired @Qualifier("http-client-pool") CommonsPool2TargetSource httpclients;
    @Autowired ServletContext context;
    @Autowired HttpServletRequest request;
    @Autowired ApplicationContext appContext;
   
    private String read(String path) throws IOException { return IOUtils.toString(new InputStreamReader(context.getResourceAsStream(path))); }
    
    private String readForm(String formName) throws JSONException, IOException {
    	try {
			return new JSONObject( read(String.format("resources/dfe/%s.json", formName))).toString();
		} catch (Throwable e) {
			return new JSONObject( read(String.format("resources/examples/%s.json", formName))).toString();
		}
    }
   
    @GetMapping(value = "/dfe/{formName}", headers = "Accept=*/*", produces = "application/json")
    public ResponseEntity<String> a( @PathVariable("formName") String formName ) throws IOException {
    	//System.out.println(request.getHeader("User-Agent"));
    	return new ResponseEntity<>(String.valueOf(request.getHeader("User-Agent").matches(".*(Chrome|Firefox).*")), HttpStatus.OK);
    	//return new ResponseEntity<>(readForm(formName.replaceAll("-", "\\.")), HttpStatus.OK);
    }
   
    @GetMapping(value = "/arf/{arfName}", headers = "Accept=*/*", produces = "application/json")
    public ResponseEntity<String> b( @PathVariable("arfName") String arfName ) throws IOException {
    	JSONObject quote = new JSONObject( read("resources/others/" + arfName + ".json") );
        return new ResponseEntity<>(quote.toString(), HttpStatus.OK);
    }
   
	@PostMapping(value = "/post")
    public ResponseEntity<String> c( @RequestBody String jsonStr ) throws Exception {
        JSONObject json = new JSONObject( jsonStr );
         
        String local = String.format("%s://%s:%d", request.getScheme(), request.getServerName(), request.getServerPort());
        ScriptEngine nashorn = null;
        try {
	        nashorn = (ScriptEngine)engines.getTarget();
	        Bindings b = nashorn.getBindings(ScriptContext.ENGINE_SCOPE);
	 
	        b.put("servletContext", context);
	        b.put("arf", json);
	        b.put("dfe", readForm( ((JSONObject)((JSONArray) json.get("policy")).get(0)).get("formname").toString()) );                        
	        b.put("localName", local);
	        b.put("bindings", b);
	        
	        String jsonResp = (String) nashorn.eval("DfeValidator.validateStringify(arf, dfe)");	        
	        return new ResponseEntity<>(jsonResp, HttpStatus.OK);
        } finally {
        	engines.releaseTarget(nashorn);
        }
    }
    
    @RequestMapping(value = "/AJAXServlet.srv", headers = "Accept=*/*", produces = "application/json")
    public ResponseEntity<String> d( @RequestParam("method") String method, @RequestParam Map<String, String> opts ) throws Exception {
    	ScriptHelper helper = appContext.getBeansOfType(ScriptHelper.class).get(method);
    	if(helper != null) {
    		JSONObject response = new JSONObject();
    		response.put("result", helper.getResult(opts) );
    		response.put("status", "success");
    		return new ResponseEntity<>(response.toString(), HttpStatus.OK);
    	}
    	HttpClient client = null;
    	try {
    		client = (HttpClient)httpclients.getTarget();
    		List<NameValuePair> getParameters = opts.entrySet().stream().map(o -> new BasicNameValuePair(o.getKey(), o.getValue().toString())).collect(Collectors.toList());
    		HttpUriRequest req = new HttpPost( "https://arrowheadexchange.com/AJAXServlet.srv?" + URLEncodedUtils.format(getParameters, "utf-8") );
    		HttpResponse resp = client.execute(req);
    		return new ResponseEntity<>( IOUtils.toString(resp.getEntity().getContent(), Charset.defaultCharset()) , HttpStatus.OK);
		} finally {
			httpclients.releaseTarget(client);
		}
    }
               
}