package com.arrow.util.nashorn;

import java.io.IOException;
import java.nio.charset.Charset;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.client.utils.URLEncodedUtils;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.impl.conn.tsccm.ThreadSafeClientConnManager;
import org.apache.http.message.BasicNameValuePair;
import org.apache.log4j.Logger;

import com.arrow.common.EnvironmentInfo;

public class AjaxHandler {
	
	private static final Logger log = Logger.getLogger(AjaxHandler.class);
	private final static HttpClient client = new DefaultHttpClient(new ThreadSafeClientConnManager());

	@SuppressWarnings({ "unchecked", "restriction" })
	public static void handle(jdk.nashorn.api.scripting.ScriptObjectMirror context, String path, String meth, String dataType, Object request, Object headers) throws IOException {
		final String localName = "";//EnvironmentInfo.getInstance().getBaseAExUrl().toString();
		Charset cs = Charset.defaultCharset();
		HttpUriRequest req = null;
		String method = StringUtils.isEmpty(meth) ? "GET" : meth.toUpperCase();
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
		try {
			resp = client.execute(req);
			strResponse = IOUtils.toString(resp.getEntity().getContent(), cs.name());
			context.put("responseString", strResponse);
			context.put("errorString", "");
			status = "success";
		} catch (Throwable e) {
			trace(e, resp, strResponse, localName, path, method, dataType, request, headers);
			context.put("errorString", e.toString());
			status = "error";
		} finally {
			context.put("statusCode", Integer.valueOf(resp != null ? resp.getStatusLine().getStatusCode() : 500));
			context.put("statusString", status);
		}	
	}
	
	private final static void trace(Throwable e, HttpResponse httpResponse, String response, String localName, String path, String method, String dataType, Object request, Object headers) {
		log.error("AjaxHandler::handle", e);
		log.error("Request parameters:");
		log.error(localName);
		log.error(path);
		log.error(method);
		log.error(dataType);
		log.error(request);
		log.error(headers);
		log.error("Response, if available:");
		log.error(httpResponse.getStatusLine().toString());
		log.error(response);
	}
	
	public final static void primeNashornAjaxCache(@SuppressWarnings("unused") String scriptName, String key, String jsonResponse) {
		NashornUtils.execute("function(k, v){ ajaxCache.put(k, v, 'json', 'success') }", key, jsonResponse);
	}
	
	/*
	//private final static CommonsPoolTargetSource clients = AexApplicationContext.getBean("http-client-pool", CommonsPoolTargetSource.class);
	 * 
    <bean id="http-client" class="org.apache.http.impl.client.DefaultHttpClient" scope="prototype" lazy-init="true"/>
    
    <bean id="http-client-pool" class="org.springframework.aop.target.CommonsPoolTargetSource" lazy-init="true">
        <property name="targetBeanName" value="http-client"/>
        <property name="maxSize" value="5"/>    
    </bean>   
	 * */
}
