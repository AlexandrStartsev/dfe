package com.arrow.webrate.servlets;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.io.StringReader;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.io.IOUtils;
import org.apache.log4j.Logger;

import com.arrow.common.BuildEnvironment;
import com.arrow.common.EnvironmentInfo;
import com.arrow.model.annotations.Protected;
import com.arrow.util.experimental.ExperimentalUtilsFactory;
import com.arrow.webrate.PolicyModel;
import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import com.google.common.reflect.TypeToken;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

public class DfeServlet extends HttpServlet {
	static final Logger log = Logger.getLogger(DfeServlet.class);
	/**
	 * 
	 */
	private final static long serialVersionUID = -3436856710990400539L;
	final static Gson gson = new GsonBuilder().create();
	private static final Gson gsonpp = new GsonBuilder().setPrettyPrinting().create();
	final static ExecutorService executorService = Executors.newCachedThreadPool();
		
	@SuppressWarnings("serial")
	final static TypeToken<Map<String, Object>> umTt = new TypeToken<Map<String, Object>>(){};
	
	private final static String blankDfe = "defineForm(\"@FORM_NAME\",[\"require\",\"dfe-common\",\"components/div\",\"components/label\"],function(require,cmn,a,b){return new class{constructor(){this.dfe=[{name:\"root\",component:a,get:$$=>$$('policy'),atr:()=>({vstrategy:'always',style:'width: 550px'})},{name:\"error\",component:b,parent:\"root\",val:$$=>$$.error(\"I'm an autogenerated page.<br>Page \"+$$('.formname')+\" appears to be unavailable.<br>Feel free to hit F10 and put some fields here.\"),atr:()=>({vstrategy: 'always'})}]}onstart($$){}onpost($$){}}()});";
	
	
	public static boolean modificationPermitted(HttpSession session) {
		
		return ("000000".equals(session.getAttribute("login_prodcode")) ||
				"111111".equals(session.getAttribute("login_prodcode"))) &&
			EnvironmentInfo.getInstance().getBuildEnvironment() != BuildEnvironment.LIVE;
	} 
	
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		HttpSession session = req.getSession();
		
		if( session.getAttribute("login_prodcode") == null ) {
			resp.sendError(HttpServletResponse.SC_UNAUTHORIZED);
			return ;				
		}
		
		final String action = req.getParameter("a");// getRequestURI().replace("/DfeServlet.srv/", "");
		final String param = req.getParameter("p");		
		
		try {
			if( "model".equals(action) ) {
				resp.setContentType("application/json");
				resp.getWriter().write(gson.toJson( ((PolicyModel) session.getAttribute("model")).cloneAsUniformMap(Protected.UI_READONLY) ));
				return ;
			}
			
			if( "modelpp".equals(action) ) {
				resp.setContentType("text/plain");
				resp.getWriter().write(gsonpp.toJson( ((PolicyModel) session.getAttribute("model")).cloneAsUniformMap(Protected.UI_READONLY) ));
				return ;
			}
			
			if( "dfe".equals(action) ) {
		        resp.setContentType("application/json");
		        FormStore fs = getForm(param.replace("/", ""), session);
				String code = req.getHeader("User-Agent").matches(".*(Chrome|Firefox).*") ? fs.jsForm : fs.es5Form.get(); // TODO: elaborate this, check version etc (tho it will work as is in 99.99% cases) 
				IOUtils.copy(new StringReader( code ), resp.getWriter());
				return ;
			}		
		} catch(Throwable e) {
			resp.setContentType("text/plain");
			log.error("DfeServlet::doGet(" + action + ")", e);
			e.printStackTrace(new PrintWriter(resp.getWriter()));
			resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			return ;
		}
		
		if( ! modificationPermitted(session) ) {
			resp.sendError(HttpServletResponse.SC_FORBIDDEN);
			return ;				
		}
		
		if( "disable".equals(action) ) {
			session.setAttribute("experimental", "N");
			resp.getWriter().write("Experimental mode disabled");
			session.removeAttribute("dfestore");
		}

		if( "enable".equals(action) ) {
			session.setAttribute("experimental", "Y");
			resp.getWriter().write("Experimental mode enabled");
		}
	}
	
	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		HttpSession session = req.getSession();
		
		if( session.getAttribute("login_prodcode") == null ) {
			resp.sendError(HttpServletResponse.SC_UNAUTHORIZED);
			return ;				
		}
		
		ServletContext context = req.getServletContext();

		//final String uri = req.getRequestURI().replace("/DfeServlet.srv/", "");
		final String action = req.getParameter("a");// getRequestURI().replace("/DfeServlet.srv/", "");
		final String param = req.getParameter("p");
		
		if( "model".equals(action) ) {
			String strModel = IOUtils.toString(req.getReader());
			try {
				resp.setContentType("application/json");
				resp.getWriter().write(validateStore(strModel, session));
			}
			catch (Exception e) {
				resp.setContentType("text/plain");
				log.error("DfeServlet::doPost(model)", e);
				e.printStackTrace(new PrintWriter(resp.getWriter()));
				resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			}
		}
		if( "dfe".equals(action) ) {
			if( ! modificationPermitted(session) ) {
				resp.sendError(HttpServletResponse.SC_FORBIDDEN);
				return ;				
			}
			try {
				setForm(param.replace("/", ""), IOUtils.toString(req.getReader()), session);
			} catch (Exception e) {
				resp.setContentType("text/plain");
				log.error("DfeServlet::doPost(dfe)", e);
				e.printStackTrace(new PrintWriter(resp.getWriter()));
				resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			}
			resp.setStatus(HttpServletResponse.SC_OK);
			resp.getWriter().write("{ \"result\": \"true\" }");
		}
	}	
	
	@SuppressWarnings({ "unchecked", "boxing" })
	public static String validateStore (String strModel, HttpSession session) throws Exception {
		Map<String, Object> json = gson.fromJson(strModel, umTt.getType());
		String formName = ((List<Map<String, String>>)json.get("policy")).get(0).get("formname");
		String strResp = (String)ExperimentalUtilsFactory.execute("function(model, form, servletContext) { return JSON.stringify(require('validation/validator').validate(JSON.parse(model), form)) }", 
																		strModel, getForm(formName, session).getScriptForm()); 
        Map<String, Object> validationResult = gson.fromJson(strResp, umTt.getType());
        if( (Boolean)validationResult.get("result") ) {
	        PolicyModel model = (PolicyModel) session.getAttribute("model");
			// TODO: ugly. need to configure gson to parse integers into integers
			fixDoubles(json); 
			model.mergeFromUniformMap(json, Protected.UNPROTECTED);
		}
        return strResp;
	}

	static void fixDoubles(Map<String, Object> postData) {
		postData.entrySet().forEach(e -> {
			Object v = e.getValue();
			if(v instanceof Double && ((Double)v).longValue() == (Double)v ) 
				e.setValue(((Double)v).longValue()); 
			if(v instanceof List) 
				((List<Map<String, Object>>)v).forEach(DfeServlet::fixDoubles);
		});
	}	
	
	@Override
	protected long getLastModified(HttpServletRequest req) {
		/*try {
			if(EnvironmentInfo.getInstance().getBuildEnvironment() == BuildEnvironment.LIVE && "dfe".equals(req.getParameter("a"))) {
				return getForm(req.getParameter("p").replace("/", ""), req.getSession()).timestamp;
			}
		} catch(Throwable e) { }*/
		return -1;
	}
	
	public static class FormStore {
		private final Future<Object> form;
		public final String jsForm;
		public final Future<String> es5Form;
		public final long timestamp;
		
		public FormStore(String jsForm, String formName, long ts, String transpiled) {
			this.timestamp = ts;
			this.jsForm = jsForm;//.replaceAll("\\r\\n *","");
			this.es5Form = DfeServlet.executorService.submit(new Callable<String>() {
				@Override
				public String call() throws Exception {
					String command = "function(code) { return require('babel').transform(code, { plugins: ['transform-es3-property-literals', 'transform-es3-member-expression-literals'], presets : ['es2015']}).code}";
					return transpiled == null ? (String)ExperimentalUtilsFactory.execute(command, jsForm) : transpiled;
				}
			});
			
			this.form = DfeServlet.executorService.submit(new Callable<Object>() {
				@Override
				public Object call() throws Exception {
					long t = System.currentTimeMillis();
					try {					
						Map<String, String> arg = new HashMap<>();
						arg.put("name", "forms/babel/" + formName + ".js");
						arg.put("script", FormStore.this.es5Form.get());
						return ExperimentalUtilsFactory.execute("load", arg);
					} finally {
						log.warn("Nashorn form creation took: " + (System.currentTimeMillis() - t) + "ms");
					}
				}
			});
		}
		
		public Object getScriptForm() throws InterruptedException, ExecutionException {
			return this.form.get();
		}
	}
	
	final static Cache<String, FormStore> globalFormCache = CacheBuilder.newBuilder().build();
	
	@SuppressWarnings("unchecked")
	public static FormStore getForm(String formName, HttpSession session) {
		try {
			Object store = session.getAttribute("dfestore");
			if(!(store instanceof Cache))
				session.setAttribute("dfestore", store = CacheBuilder.newBuilder().build());
			return ((Cache<String, FormStore>)store).get(formName, new Callable<FormStore>() {
	
				@Override
				public FormStore call() throws Exception {
					return globalFormCache.get(formName, new Callable<FormStore>() {
						@Override
						public FormStore call() throws Exception {
							try {
								String path = "conf/dfe-experimental/forms/" + formName + ".js";
								String transpiled = null;
								try {
									String tpath = "conf/dfe-experimental/forms/.transpiled/" + formName + ".js";
									transpiled = IOUtils.toString(new InputStreamReader(this.getClass().getClassLoader().getResourceAsStream(tpath)));
								} catch( Exception e ) {
									// do nothing
								}
								long ts = resourceLastModified(path);
								return new FormStore(IOUtils.toString(new InputStreamReader(this.getClass().getClassLoader().getResourceAsStream(path))), formName, ts, transpiled);
							} catch (Throwable e) {
								DfeServlet.log.error("Error retrieving form: " + formName, e);
								return new FormStore(blankDfe.replace("@FORM_NAME", formName), formName, -1, null);
							}
						}
					});
				}
			});
		} catch(ExecutionException e) {
			throw new RuntimeException(e);
		}
	}
	
	static long resourceLastModified(String path) {
		try {
			return new java.io.File(DfeServlet.class.getClassLoader().getResource(path).getFile().replaceAll("^file:/|!.*$", "")).lastModified();
		} catch (Exception e) {
			return -1;
		} 
	}
	
	@SuppressWarnings("unchecked")
	private static void setForm(String formName, String jsForm, HttpSession session) {
		Object store = session.getAttribute("dfestore");
		if(!(store instanceof Cache))
			session.setAttribute("dfestore", store = CacheBuilder.newBuilder().build());
		((Cache<String, FormStore>)store).put(formName, new FormStore(jsForm, formName, System.currentTimeMillis(), null));
	}
}
