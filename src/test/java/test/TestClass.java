package test;

import static org.junit.Assert.assertArrayEquals;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeoutException;

import javax.script.ScriptEngineManager;
import javax.script.ScriptException;

import org.apache.commons.io.IOUtils;
import org.asynchttpclient.AsyncHttpClient;
import org.asynchttpclient.Dsl;

import com.google.common.collect.ImmutableMap;
import com.google.common.reflect.TypeToken;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import jdk.nashorn.api.scripting.NashornScriptEngine;

@SuppressWarnings({"restriction", "unused", "serial"})
public class TestClass {
	private final static Gson gson =  new GsonBuilder().create();
	
	public static void main(String[] args) throws ScriptException, InterruptedException, ExecutionException, IOException, TimeoutException {
		final LinkedBlockingQueue<Object> queue = new LinkedBlockingQueue<>();
		
		final AsyncHttpClient client = Dsl.asyncHttpClient();
		final List<Thread> all = new ArrayList<>();
		
		final String model = IOUtils.toString(Thread.currentThread().getContextClassLoader().getResourceAsStream("100cars.json"), "UTF-8");
		
		try {
			//int pattern[] = {200, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50}; //{0, 1, 2, 3, 10, 20, 6, 7, 7, 7, 30, 10, 2, 5, 10, 15, 1, 10, 2, 50, 50, 50 };
			for(int i = 0; i < 1; i ++) {
				//System.out.println("Interrupt test: interrupting in " + pattern[i] + " s");
				Thread tt = new Thread() {
					@Override
					public void run() {
						try {
							try{
								NashornScriptEngine e = (NashornScriptEngine)new ScriptEngineManager().getEngineByName("nashorn");
										
								e.put("__httpClient", client);
								e.put("queue", queue);
								e.eval("load('classpath:./test.js')");
							} catch(Throwable ex) {
								ex.printStackTrace(System.err);
							}
						} catch (Throwable e) {
							e.printStackTrace();
						}
					}
				};
				all.add(tt);
				tt.start();
				
				for(int t = 0; t < 1000; t++) {
					long ts = System.currentTimeMillis();
					CompletableFuture<String> cb = new CompletableFuture<>();
					queue.put(ImmutableMap.of("formName", "quote.cmau.car", "model", model, "callback", cb));
					String response = cb.get();
					//assert gson.fromJson(response, new TypeToken<List<String>>() {}.getType()) instanceof List;
					System.out.println(t + ": " + (System.currentTimeMillis() - ts) + " ms");
					
					//if(t < 100) Thread.sleep(50);
				}
				// ending event loop
				tt.interrupt();
			}
			for(Thread tt : all) tt.join();
		} finally {
			client.close();
		}
	}
}
