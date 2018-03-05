package com.arrow.util.experimental;

import java.io.IOException;
import java.nio.charset.Charset;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.script.Bindings;
import javax.servlet.RequestDispatcher;
import javax.servlet.ServletContext;

import org.apache.commons.io.IOUtils;
//import org.apache.commons.lang.StringUtils;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.client.utils.URLEncodedUtils;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.message.BasicNameValuePair;
//import org.springframework.aop.target.CommonsPoolTargetSource;

//import com.arrow.common.EnvironmentInfo;
//import com.arrow.util.AexApplicationContext;
import com.google.common.reflect.TypeToken;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

public class AjaxHandler {
	
	//private final static CommonsPoolTargetSource clients = AexApplicationContext.getBean("http-client-pool", CommonsPoolTargetSource.class);
	private final static HttpClient clients = HttpClientBuilder.create().build(); 
		
	private final static Gson gson = new GsonBuilder().create();
	@SuppressWarnings("serial")
	private final static TypeToken<Map<String, Object>> umTt = new TypeToken<Map<String, Object>>(){};
	
	/** TODO: 
	  * Important: this needs HttpClient pool + dispatch internally for local url's
	  */
	
	@SuppressWarnings("unchecked")
	public void handle(Bindings bindings, ServletContext context, String localName, String path, String method, String dataType, Object request, Object headers) throws IOException {
		RequestDispatcher dispatcher = context.getRequestDispatcher(path);
		if(dispatcher != null) {
			//localHandler.forward(request, response); - have to come up with servletrequest/servletresponse pair based on parameters.
		}	
		
		localName = "http://localhost:7001"; //EnvironmentInfo.getInstance().getBaseAExUrl().toString();
		Charset cs = Charset.defaultCharset();
		HttpUriRequest req = null;
		method = method == null || method.isEmpty() ? "GET" : method.toUpperCase();
		Map<String, Object> data = request.toString() != "undefined" ? (Map<String, Object>) request : new HashMap<>();
		if( method.equals("POST") ) {
			HttpPost post = new HttpPost(path.startsWith("http") ? path : localName + path);
			if (request instanceof String) {
				post.setEntity(new StringEntity(request.toString()));
			} else {
				List<NameValuePair> postParameters = data.entrySet().stream().map(o -> new BasicNameValuePair(o.getKey(), o.getValue().toString())).collect(Collectors.toList());
				post.setEntity(new UrlEncodedFormEntity(postParameters, cs));
				if(headers.toString() != "undefined") ((Map<String, Object>)headers).entrySet().stream().forEach(o -> post.addHeader(o.getKey(), o.getValue().toString()));
			}
			req = post;
		}
		if( method.equals("GET") ) {
			List<NameValuePair> getParameters = data.entrySet().stream().map(o -> new BasicNameValuePair(o.getKey(), o.getValue().toString())).collect(Collectors.toList());
			req = new HttpGet( (path.startsWith("http") ? path : localName + path) + (getParameters.size() > 0 ? "?" + URLEncodedUtils.format(getParameters, cs.name()) : ""));
		}
		HttpResponse resp = null;
		String status = "unknown", strResponse = "";
		HttpClient client = null; 
		try {
			client = clients;  //(HttpClient)clients.getTarget();
			resp = client.execute(req);
			strResponse = IOUtils.toString(resp.getEntity().getContent(), cs.name());
			bindings.put("strResponse", strResponse);
			status = "success";
		} catch (Throwable e) {
			trace(e, resp, strResponse, localName, path, method, dataType, request, headers);
			bindings.put("strError", e.toString());
			status = "error";
		} finally {
			try {
				//clients.releaseTarget(client);
			}
			catch (Exception e) {
				bindings.put("strError", e.toString());
				status = "error";
			}
			bindings.put("statusCode", Integer.valueOf(resp != null ? resp.getStatusLine().getStatusCode() : 500));
			bindings.put("status", status);
		}		
	}
	
	private final static void trace(Throwable e, HttpResponse httpResponse, String response, String localName, String path, String method, String dataType, Object request, Object headers) {
		System.err.println("AjaxHandler::handle errored:");
		e.printStackTrace(System.err);
		System.err.println("Request parameters:");
		System.err.println(localName);
		System.err.println(path);
		System.err.println(method);
		System.err.println(dataType);
		System.err.println(request);
		System.err.println(headers);
		System.err.println("Response, if available:");
		System.err.println(response);
	}
}
