package edu.alex;


import java.io.IOException;
import java.io.InputStreamReader;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;
import javax.servlet.ServletContext;

import org.apache.commons.io.IOUtils;
import org.apache.http.client.HttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.springframework.aop.target.CommonsPool2TargetSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;

@Configuration
public class ContextConfig {
	@Autowired ServletContext context; 
	
	private String read(String path) throws IOException { return IOUtils.toString(new InputStreamReader(context.getResourceAsStream(path))); } 
	
	@Bean("nashorn")
	@Scope("prototype")
	public ScriptEngine nashorn() throws IOException {
		ScriptEngine engine = new ScriptEngineManager().getEngineByName("nashorn");
		try {
			engine.eval(read("resources/js/nashorn-utils.js"));
			engine.eval(read("resources/js/dfe-core.js"));
			engine.eval(read("resources/js/dfe-validator.js"));
			engine.eval(read("resources/js/extras.js"));
			return engine;		
		} catch (ScriptException e) {
			e.printStackTrace(System.err);
			throw new RuntimeException();
		}
	}
	
	@Bean("js-engine-pool")
    public CommonsPool2TargetSource engines() { 
		CommonsPool2TargetSource ts = new CommonsPool2TargetSource();
		ts.setMaxSize(5);
		ts.setTargetBeanName("nashorn");
        return ts;
    }
	
	@Bean("http-client")
	@Scope("prototype")
	public HttpClient httpclient() {
		return HttpClientBuilder.create().build();
	}
	
	@Bean("http-client-pool")
    public CommonsPool2TargetSource httpclients() { 
		CommonsPool2TargetSource ts = new CommonsPool2TargetSource();
		ts.setMaxSize(5);
		ts.setTargetBeanName("http-client");
        return ts;
    }
	

}
