package edu.alex;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
public class AppController {
	  @Autowired HttpServletRequest request;
	
	  @RequestMapping(path={"/"},method=RequestMethod.GET)
	   public String p1(Model model) {
	      model.addAttribute("user","alex");
	      request.setAttribute("form-name", "quote-cmau-car");
	      return "app";
	   }

	  @RequestMapping(path={"/examples/{formName}"},method=RequestMethod.GET)
	   public String p1a(Model model, @PathVariable("formName") String formName) {
	      model.addAttribute("user","alex");
	      request.setAttribute("form-name", formName);
	      return "app";
	   }

	  @RequestMapping(path={"/editor"},method=RequestMethod.GET)
	   public String p2(Model model) {
	      model.addAttribute("user","alex");
	      return "editor";
	   }		 	  
}
