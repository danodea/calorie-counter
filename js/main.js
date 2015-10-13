/*
	This app will track calories.
	When you search for food, it will
	make an API call, and the turn that
	JSON response into a list of foods.

	When you click a food, it will be added
	to the list of food in your meal,
	and the total calories will update.
*/

// All our foods will be the same model
var Food = Backbone.Model.extend({

	defaults: {

	}

});

//This collection will manage the API call and response
var SearchFoods = Backbone.Collection.extend({
	model: Food,
	url: '',

	//Need to convert the API data into models
	parse: function(data) {
		return _.map(data.hits, function(hit) {
			return new Food(hit);
		})
	}
});

//This collection will manage the foods that we ate
var MealFoods = Backbone.Collection.extend({
	model: Food
});

//This view will instantiate the search bar,
//and will manage the overall list view
var SearchList = Backbone.View.extend({
	el: $('#search'),

	events: {
		'click button#searchButton': 'search'
	},

	initialize: function(){
		_.bindAll(this, 'render', 'search', 'resetSearchList');

		this.collection = new SearchFoods();
		this.listenTo(this.collection, 'reset', this.resetSearchList);

		this.render();
	},

	render: function(){
		$(this.el).append("<input type='text' id='searchField'></input>");
		$(this.el).append("<button id='searchButton'>Search!</button>");
		$(this.el).append("<ul id='search-food-list'></ul>");
	},

	//Update the collection URL to make and send the correct API call.
	//Could just pass the searchField.val() to the collection and handle this there?
	search: function(){
		var searchTerm = $('#searchField').val();
		this.collection.url =
			'https://api.nutritionix.com/v1_1/search/' +
			searchTerm +
			'?fields=item_name%2Cbrand_name%2Cnf_calories&appId=58a3a103&appKey=fbcefe5014170fc55dd1fef3d0292a16'
		;
		this.collection.fetch({reset: true});
	},

	//clear the list and repopulate with new items
	resetSearchList: function(){
		$('#search-food-list').html('');
		_.each(this.collection.models, function(model){
			var view = new SearchedFoodItem({model: model});
   			$('#search-food-list').append( view.render().el );
		})
	}
});

//This view will handle all the searched food models
var SearchedFoodItem = Backbone.View.extend({
	tagName: 'li',

	template: _.template($('#food-search-template').html()),

	events: {
		'click #add': 'addToMeal'
	},

	intialize: function(){
		_.bindAll(this, 'render', 'addToMeal')
	},

	render: function(){
		$(this.el).html( this.template(this.model.attributes.fields) );
		return this;
	},

	addToMeal: function(){
		Meal.collection.add(this.model.clone());
	}
});

//This view will handle the meal
var Meal = Backbone.View.extend({
	el: $('#meal'),

	events: {

	},

	initialize: function(){
		_.bindAll(this, 'render', 'addMealItemToList');

		this.collection = new MealFoods();
		this.listenTo(this.collection, 'add', this.addMealItemToList);

		this.render();
	},

	render: function(){
		$(this.el).append("<h1>Meal!</h1>");
		$(this.el).append("<ul id='meal-food-list'></ul>");
		$(this.el).append("<p id='total'>Total Calories: <span>0</span></p>");
	},

	addMealItemToList: function(model){
		var view = new MealItem({model: model});
		$('#meal-food-list').append(view.render().el);
	}
});

//A view for each item in the meal
var MealItem = Backbone.View.extend({
	tagName: 'li',

	template: _.template($('#meal-item-template').html()),

	events: {
		'click #remove': 'removeMealItem'
	},

	initialize: function(){
		_.bindAll(this, 'render', 'removeMealItem');
	},

	render: function(){
		$(this.el).html( this.template(this.model.attributes.fields) );
		return this;
	},

	removeMealItem: function(){
		this.remove();
	}
})

var Search = new SearchList;
var Meal = new Meal;