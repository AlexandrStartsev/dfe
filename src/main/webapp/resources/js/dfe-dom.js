define(function() {
    if(typeof document !== 'undefined') {
        return document; 
    }
    
	var innerContentAllowed = new Set();
	['AREA', 'BASE', 'BR', 'COL', 'COMMAND', 'EMBED', 'HR', 'IMG', 'INPUT', 'KEYGEN', 'LINK', 'META', 'PARAM', 'SOURCE', 'TRACK', 'WBR'].forEach(function(tag) { innerContentAllowed.add(tag) });
	
    
	function escapeHtml(str) {
	    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
	}
	
	function Node(type) {
        type = new String(type).toString();
		this.nodeName = type.charAt(0) == '#' ? type : type.toUpperCase();
		this.attributes = {};
		this.firstChild = null;
		this.lastChild = null;
		this.nextSibling = null;
		this.parentNode = null;
		this.nodeValue = null;
	} 
	
	Node.prototype.serialize = function(out, outer){
        var attrs = Object.keys(this.attributes).map(
			function(key) {
				if(['disabled', 'checked', 'selected'].indexOf(key) >= 0) {
					return !!this.attributes[key] ? key + '=""' : '';
				} else {
					var value = new String(this.attributes[key]).toString();
					return key + '="' + escapeHtml(value) + '"';
				}
			}, this
		).join(' ');
		outer && out.push('<' + this.nodeName + (attrs ? ' ' + attrs : '') + (this.firstChild ? '>' : '/>'));
		for(var c = this.firstChild; c; c = c.nextSibling) {
			c.serialize(out, true);
		}
		if( outer && this.firstChild ) {
			out.push( '</' + this.nodeName + '>' )
			
		}
        return out;
	}
	
	Node.prototype.setAttribute = function(name, value) {
		this.attributes[name] = new String(value).toString();
	}
	
	Node.prototype.removeAttribute = function(name) {
		delete this.attributes[name];
	}
	
	Node.prototype.addEventListener = function() {
		
	}
	
	Node.prototype.removeEventListener = function() {
		
	}
	
	Node.prototype.removeChild = function(node) {
		if(node === null || node.parentNode !== this) {
			throw new Error('Node is not the child of current node');
		}
		if(node === this.firstChild) {
			if((this.firstChild = this.firstChild.nextSibling) === null ) {
				this.lastChild = null;
			}
		} else {
			for(var c = this.firstChild; c.nextSibling !== node; c = c.nextSibling) {}
			if((c.nextSibling = node.nextSibling) === null) {
				this.lastChild = c;
			}
		}
		node.parentNode = null;
		node.nextSibling = null;
		return node;
	}
	
	Node.prototype.appendChild = function(node) {
		if(node.parentNode) {
			if(this.lastChild === node) {
				return ;
			}
			node.parentNode.removeChild(node);
		}
		if(this.lastChild) {
			this.lastChild = (this.lastChild.nextSibling = node);
		} else {
			this.firstChild = this.lastChild = node;
		}
		node.parentNode = this;
		return node;
	}
	
	Node.prototype.insertBefore = function(node, other) {
		if(other === null) {
			this.appendChild(node);
		} else {
			if(other.parentNode !== this) {
				throw new Error('Other node is not the child of current node');
			}
			if(node !== this.firstChild) {
				if(node.parentNode) {
					node.parentNode.removeChild(node);
				}
				if(other === this.firstChild) {
					this.firstChild = node;
				} else {
					for(var c = this.firstChild; c.nextSibling !== other; c = c.nextSibling) {}
					c.nextSibling = node;
				}
				node.parentNode = this;
				node.nextSibling = other;
			}
		}
		return node;
	}

	// TODO: properties
	/*
		innerHTML: string
		disabled: boolean  // attr: disabled=""
		nodeValue: string  // #text node value
		value: string   // attr: value="...."
		checked: boolean // // attr: checked=""
		innerText: string // ...>some text<...
		selectedIndex: integer // which option has selected=""
		text : string // same as innerText / only certain types.
		colSpan: integer
		rowSpan: integer
		*/
	
	Object.defineProperties(Node.prototype, {
		outerHTML: {
			enumerable: false,
			get: function() {
				var out = [];
				this.serialize(out, true);
				return out.join('');
			}
		},
		innerHTML: {
			enumerable: false,
			get: function() {
				var out = [];
				this.serialize(out, false);
				return out.join('');
			},
			set: function(html) {
				while(this.firstChild) {
					this.removeChild(this.firstChild);
				}
				this.appendChild(new HtmlNode(html));
			}
		},
		innerText: {
			enumerable: false,
			get: function() {
				var ret = "";
				for(var n = this.firstChild; n; n = n.nextSibling) {
					var p = n.innerText;
					p && (ret = ret + p + '\n');
				}
				return ret;
			},
			set: function(text) {
				while(this.firstChild) {
					this.removeChild(this.firstChild);
				}
				this.appendChild(new TextNode(text));
			}
		},
		text: {
			enumerable: false,
			get: function() {
                return this.innerText;
			},
			set: function(text) {
				this.innerText = text;
			}
		},
		disabled: { get: function() { return this.attributes.disabled; }, set: function(value) { this.attributes.disabled = !!value; } },
		checked: { get: function() { return this.attributes.checked; }, set: function(value) { this.attributes.checked = !!value; } },
		selected: { get: function() { return this.attributes.selected; }, set: function(value) { this.attributes.selected = !!value; } },
		value: { get: function() { return this.attributes.value; }, set: function(value) { this.attributes.value = new String(value).toString(); } },
		colSpan: { get: function() { return isNaN(this.attributes.colSpan) ? 1 : this.attributes.colSpan; }, set: function(value) { if(isNaN(value) || value < 0) delete this.attributes.colSpan; else this.attributes.colSpan = value; } },
		rowSpan: { get: function() { return isNaN(this.attributes.rowSpan) ? 1 : this.attributes.rowSpan; }, set: function(value) { if(isNaN(value) || value < 0) delete this.attributes.rowSpan; else this.attributes.rowSpan = value; } },
		selectedIndex: {
			get: function() {
				for(var pos = 0, c = this.firstChild; c; c = c.nextSibling) {
					if(c.attributes.selected) {
						return pos;
					} 
					pos++;
				}
				return -1;
			},
			set: function(index) {
				for(var i = 0, c = this.firstChild; c; i++, (c = c.nextSibling)) {
					c.selected = i === index
				}
			}
		}
	})
    Node.prototype.text = Node.prototype.innerText;
	
	function HtmlNode(html) {
		Node.call(this, '#html');
		this.nodeValue = html;
	}
	
	HtmlNode.prototype = new Node();
	HtmlNode.prototype.constructor = HtmlNode;
	HtmlNode.prototype.serialize = function(out) {
		out.push(this.nodeValue);
	}
	
	function TextNode(text) {
		Node.call(this, '#text');
		this.nodeValue = text;
	}
	
	TextNode.prototype = new Node();
	TextNode.prototype.constructor = TextNode;
	TextNode.prototype.serialize = function(out) {
		out.push(this.nodeValue);
	}	
	Object.defineProperties(TextNode.prototype, {
		innerText: {
			enumerable: false,
			get: function() {
				return this.nodeValue;
			},
			set: function(text) {
				this.nodeValue = text;
			}
		},
		text: {
			enumerable: false,
			get: function() {
				return this.nodeValue;
			},
			set: function(text) {
				this.nodeValue = text;
			}
		}
	})
	
    return {
    	createElement: function(type) { return new Node(type) },
    	createTextNode: function(content) { return new TextNode(content) },
    	activeElement: null,
    	// TODO: intercept custom styles from *head;
    	// TODO: intercept relevant ajax cache calls and supply cache data to client (otherwise dependent controls will flicker with "Loading...") 
    	body: null,
    	head: null
    }
})