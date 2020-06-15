var eventBus = new Vue();

var event = {
  props: ['event'],
  template: `<div class="card border-dark  mb-5 event" v-on:click="updateEvent">
  <div class="card-header">{{ event.date.replace('T', ' ').replace('Z', '') }} <button class="btn btn-danger" style='width: 30px;height: 30px; padding: 0; float: right' v-on:click.stop.prevent="deleteEvent">X</button></div>
  <div class="card-body">
    <h5 class="card-title">{{ event.title }}</h5>
    <p class="card-text">{{ event.description }}</p>
  </div>
</div>`,
	methods: {
		deleteEvent(){
			var success = confirm('Вы уверены что хотите удалить событие?');
			if(success){
				fetch('http://localhost:8000/'+ this.event.id + '/?user=' + this.$root.user, {method: 'DELETE'})
				this.$el.parentNode.removeChild(this.$el);
			}
		},

		updateEvent(){
			this.$root.target = this.event;
			this.$root.upa();
		},
	}
};

// Форма для изменнения/создания события
var eventform = {
  data: function(){
  	return {
  		'description': '',
  		'title': '',
  		'id': null,
  		'date': ''
  	}
  	
  },
  template: `<form>
				<input type="datetime-local" name="" class="form-control mt-3" v-model='date' require>
				<input type="text" name="" placeholder="Заголовок" class="form-control mt-3" v-model='title' require>
				<textarea class="form-control mt-3" v-model='description' require></textarea>
				<button class="btn btn-dark mt-3" v-on:click="updateOrCreate">Отправить</button>
				<button class="btn btn-danger mt-3" v-on:click="resetAll">Сбросить</button>
			</form>`,
	methods: {
		showTarget(){
			this.title = this.$root.target.title;
			this.description = this.$root.target.description;
			this.id =  this.$root.target.id;
			this.date = this.$root.target.date.replace('Z', '');
		},

		resetAll(){
			this.title = '';
			this.description = '';
			this.id =  null;
			this.date = '';
		},

		updateOrCreate(){
			if(this.$root.user == 0){
				alert("Пожалуйста, авторизуйтесь!");
				return;
			}
			var body = JSON.stringify({
				"title": this.title, 
				"description": this.description,
				"date": this.date,
				"checked": false,
				"user": this.$root.user
			});
			var headers = {
        		'content-type': 'application/json'
    		}
			if(this.id != null){
				this.updateEvent(body, headers);
			}
			else{
				this.createEvent(body, headers);
			}
		},

		updateEvent(body, headers){
			this.date = this.date.substring(0, this.date.length-3);
			var confident = confirm("Вы уверены что хотите изменить событие?");
			if(confident){
				fetch('http://localhost:8000/'+ this.id +'/', {
					method: 'PUT',
					body: body,
					headers: headers
				});

				// Изменяем данные события в app.
				for(var i=0;i<this.$root.events.length;i++){
					if(this.id = this.$root.events[i].id){
						this.$root.events[i].title = this.title;
						this.$root.events[i].date = this.date;
						this.$root.events[i].description = this.description;
					}
				}
			}
		},

		createEvent(body, headers){
			var confident = confirm("Вы уверены что хотите создать событие?");
			if(confident){
				fetch('http://localhost:8000/', {
					method: 'POST',
					body: body,
					headers: headers
				}).then((response)=>{ return response.json()}).then((data)=>this.id=data.id);
				this.$root.events.push(this);
				this.$root.empty = false;
			}
			
		},
	}
};

// Компонент для авторизации пользователя и получения его ID.
var login = {
  data: function(){
  	return {
  		'username': '',
  		'password': '',
  		'checked': false
  	}
  	
  },
  template: `
  <div>
		<div class="popup-wrapper">
		  <input type="checkbox" class="popup-checkbox" id="popupCheckboxOne" v-model="checked">
		  <div class="popup">
		    <div class="popup-content">
		      <label for="popupCheckboxOne" class="popup-closer">X</label>
		      <div>
		      	<input type="text" name="username" class="form-control mt-3" placeholder="Username: " v-model="username">
		      	<input type="password" name="password" class="form-control mt-3" placeholder="Password: " v-model="password">
		      	<button class="btn btn-success w-100 mt-2" v-on:click="loginUser">Отправить</button>
		      	<button class="btn btn-danger w-100 mt-2"  v-on:click="resetAll">Сбросить</button>
		      </div>
		    </div>
		  </div>
		</div>
		
	</div>`,
	methods: {
		loginUser(){
			fetch('http:/localhost:8000/authorize/',{
				method: 'POST',
				body: JSON.stringify({
					'username': this.username,
					'password': this.password
				}),
				headers: {
					'content-type': 'application/json'
				}
			})
			.then((response)=>{return response.json()})
			.then((data)=>this.$root.setUser(data.user));
			this.checked = false;
		},

		resetAll(){
			this.username = '';
			this.password = '';
		},
	}
};

// Компонент для регистрации пользователя
var register = {
  data: function(){
  	return {
  		'username': '',
  		'password': '',
  		'checked': false,
  		'mail': ''
  	}
  	
  },
  template: `
  <div>
		<div class="popup-wrapper">
		  <input type="checkbox" class="popup-checkbox" id="register" v-model="checked">
		  <div class="popup">
		    <div class="popup-content" style="height: 300px;">
		      <label for="register" class="popup-closer">X</label>
		      <div>
		      	<input type="text" name="username" class="form-control mt-3" placeholder="Username: " v-model="username">
		      	<input type="password" name="password" class="form-control mt-3" placeholder="Password: " v-model="password">
		      	<input type="text" name="mail" class="form-control mt-3" placeholder="Email: " v-model="mail">
		      	<button class="btn btn-success w-100 mt-2" v-on:click="registerUser">Отправить</button>
		      	<button class="btn btn-danger w-100 mt-2"  v-on:click="resetAll">Сбросить</button>
		      </div>
		    </div>
		  </div>
		</div>
		
	</div>`,
	methods: {
		resetAll(){
			this.username = '';
			this.password = '';
			this.mail = '';
		},

		registerUser(){
			fetch('http:/localhost:8000/register/',{
				method: 'POST',
				body: JSON.stringify({
					'username': this.username,
					'password': this.password,
					'mail': this.mail
				}),
				headers: {
					'content-type': 'application/json'
				}
			})
			.then((response)=>{return response.json()})
			.then((data)=>this.$root.setUser(data.user));
			this.checked = false;
		}
	}
};


// Компонент, для получения фильтров событий(период, название и т.д)
var parameters = {
	data: function(){
		return{
			'period': '',
			'contains': '',
			'loginClassName': 'popup-shower nav-link text-white',
			'registerClassName': 'popup-shower nav-link text-white'
		}
	},
  template: `<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
				<ul class="navbar-nav mr-auto mt-3">
			      <li class="nav-item dropdown">
			        <a class="nav-link dropdown-toggle text-white" href="#" id="navbarDropdownMenuLink" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
			          Период
			        </a>
			        <div class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
			          <a class="dropdown-item" href="#" v-on:click="period='month'">За последний месяц</a>
			          <a class="dropdown-item" href="#" v-on:click="period='week'">За последнюю неделю</a>
			          <a class="dropdown-item" href="#" v-on:click="period='day'">За последний день</a>
			        </div>>
			      </li>
			      <li class="nav-item">
			        	<label for="popupCheckboxOne" v-bind:class="loginClassName" style="text-decoration: none">Login</label>
			      </li>
			      <li class="nav-item">
			      		<label for="register" v-bind:class="registerClassName" style="text-decoration: none">Register</label>
			      </li>
			    </ul>

      			<div class="form-inline my-2 my-lg-0" style="float: right;">
				      <input class="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search" v-model="contains">
				      <button class="btn btn-outline-success my-2 my-sm-0" v-on:click="searchEvents">Search</button>
    			</div>
			</nav>`,
	methods: {
		searchEvents(){
			if(this.$root.user == 0){
				alert("Пожалуйста, авторизуйтесь!");
				return;
			}

			this.$root.period = this.period;
			this.$root.contains = this.contains;
			this.$root.getData();
			this.period = '',
			this.contains = '';
		},

		loginHighlight(){
			this.loginClassName = this.loginClassName.replace('text-white', 'highlight');
			setTimeout(()=>{
				this.loginClassName = this.loginClassName.replace('highlight', 'text-white');
			}, 6000);
		},
		registerHighlight(){
			this.registerClassName = this.registerClassName.replace('text-white', 'highlight');
			setTimeout(()=>{
				this.registerClassName = this.registerClassName.replace('highlight', 'text-white');
			}, 6000);
		}
	}
};

var anonymous = {
	 template: `
	 <div>
		 <img src="anonymous.jpg" class="w-100">
		 <h2 class="text-center mt-3" style="color: gray">Кто Вы?</h2>
		 <p class="mt-5">Вы не авторизованы. Для того чтобы начать пользоваться системой авторизуйтесь или зарегистрируйтесь. Для этого нажмите соответственно <a href="#" v-on:click="loginHighlight">"Login"</a> или <a href="#" v-on:click="registerHighlight">Register"</a>.</p>
	 </div>`,
	 methods: {
	 	loginHighlight(){
	 		this.$root.$refs.parameters.loginHighlight();
	 	},

	 	registerHighlight(){
	 		this.$root.$refs.parameters.registerHighlight();
	 	},
	 }
}

var empty = {
	 template: `
	 <div>
		 <h2 class="text-center mt-5 mb-5">Пусто</h2>
		 <p>Здесь пока ничего нет. Воспользуйтесь формой и добавьте событие.</p>
	 </div>`,
}


var app = new Vue({
  el: '#app',
  data: {
    events: [],
    target: {},
    period: '',
    user: 0,
    contains: '',
    empty: false
  },

  components: {
  	'event': event,
  	'eventform': eventform,
  	'login': login,
  	'parameters': parameters,
  	'anonymous': anonymous,
  	'register': register,
  	'empty': empty
  },

  methods: {
  	upa(){
  		this.$refs.event.showTarget();
  	},

  	getData(){
		fetch('http://localhost:8000/?user='+ this.user + '&format=json&date='+this.period+'&content='+this.contains, {method: 'GET'})
		.then(response=>{return response.json()}).then(data=>{
			this.events = data;
			this.empty = data == 0;
		});
	},

	setUser(user){
		this.user = user;
		this.$refs.anonymous.$el.parentNode.removeChild(this.$refs.anonymous.$el);
		this.getData();
	},
  },

});
