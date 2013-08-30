/*
Author: fdittrich@zendesk.com

Adds a phone number search field in sidebar
Agents can search users with a specific phone number
If a user is found it is set as requester of the ticket
If no user is found a new user is created (with a generated email address including the entered phone number)
*/

(function() {

  return {
    user_data: "",
    user_email: "",
    user_name: "",
    user_organization: "",
    user_organization_id: "",
    created_organization_id: "",
    orgs_loaded_counter: 0,
    users_with_orgs_counter: 0,
    phone_number: "",
    error_messages: [],
    
    events: {
      'app.activated':'init',
      'keyup .phone_number':'checkForEnter',
      'keyup .new_user_name':'capitalize',
      'keyup .new_user_organization':'capitalize',
      'searchUserWithPhoneNumber.done': 'processUserSearchResult',
      'click .create_user_button': 'createUser',
      'createUser.done':'userCreated',
      'createOrganization.done':'orgCreated',
      'createUser.fail':'userCreationFail',
      'createOrganization.fail':'orgCreationFail',
      'getOrganizationForUser.done':'processOrganizationResult',
      'click .user': 'setUserAsRequester'
    },

    requests: {
      searchUserWithPhoneNumber: function(query) {
        return {
          url: '/api/v2/search.json?query='+query+'&include=organization',
          type: 'GET'
        };
      },

      getOrganizationForUser: function(organization_id) {
        return {
          url: '/api/v2/organizations/'+organization_id+'.json',
          type: 'GET'
        };
      },

     autocompleteOrganization: function(organization_name){
       return {
         url: '/api/v2/organizations/autocomplete.json?name=' + organization_name,
         type: 'POST'
       };
     },

     findOrganization: function(organization_name){
       return {
         url: '/api/v2/organizations/autocomplete.json?name=' + organization_name,
         type: 'POST'
       };
     },

      createUser: function(user_data) {
        return {
          url: '/api/v2/users.json',
          dataType: 'JSON',
          type: 'POST',
          contentType: 'application/json',
          data: user_data
        };
      },

      createOrganization: function(org_data) {
        return {
          url: '/api/v2/organizations.json',
          dataType: 'JSON',
          type: 'POST',
          contentType: 'application/json',
          data: org_data
        };
      }
     
    },

    bindAutocompleteOnOrganization: function(){
      var self = this;

      // bypass this.form to bind the autocomplete.
      this.$('.new_user_organization').autocomplete({
        minLength: 4,
        scroll:true,
        position: { my : "right top", at: "right bottom", collision: "flip flip" },
        source: function(request, response) {
          self.ajax('autocompleteOrganization', request.term).done(function(data){
            response(_.map(data.organizations, function(organization){
              return {"label": organization.name, "value": organization.id};
            }));
          });
        },
        select: function( event, ui ) {
          self.$(".new_user_organization").attr("org_id", ui.item.value);
          self.$(".new_user_organization").attr("org_name", ui.item.label);
          setTimeout( function() {
            self.$(".new_user_organization").val(ui.item.label);
          }, 250);

        }
      });
    },

    'hasAtLeastOneOrganization': function() {
      for(var y = 0; y < this.user_data.length; y++){
        if (this.user_data[y].organization_id > 0){
          return true;
        }
      }
      return false;
    },

    'processOrganizationResult': function(data) {
      for(var y = 0; y < this.user_data.length; y++){
        if (this.user_data[y].organization_id === data.organization.id){
          this.user_data[y].organization_name = data.organization.name;
        }
      }
      
      this.orgs_loaded_counter = this.orgs_loaded_counter + 1;
            
      if (this.orgs_loaded_counter === this.users_with_orgs_counter){
        this.renderSearchResults();
      }
    },

    'renderNewUserTemplate': function(data) {

      this.switchTo('newUser', {
        phone_number: this.phone_number,
        require_email: this.settings.require_email,
        require_name: this.settings.require_name,
        require_organization: this.settings.require_organization,
        user_email: this.user_email,
        user_name: this.user_name,
        user_organization: this.user_organization,
        user_errors: this.error_messages
      });
      
      this.bindAutocompleteOnOrganization();
      
      this.$(".ui-autocomplete").css("width", "200px");
      this.$(".ui-autocomplete").css("height", "150px");
      this.$(".ui-autocomplete").css("overflow-y", "scroll");
      this.$(".ui-autocomplete").css("overflow-y", "scroll");
      this.$(".ui-autocomplete").css("overflow-x", "hidden");
      
      
      
    
    },

    'processUserSearchResult': function(data) {
      this.user_data = data.results;
      
      //no user found
      if (this.user_data.length < 1) {

        //services.notify('New user created');
        this.$('span.spinner').hide();

        //switching to new user form
        this.renderNewUserTemplate();

        return false;
      }

      // at least one user found
      if (this.hasAtLeastOneOrganization()){
        for(var y = 0; y < this.user_data.length; y++){
          if (this.user_data[y].organization_id > 0){
            this.users_with_orgs_counter = this.users_with_orgs_counter + 1;
            this.ajax('getOrganizationForUser', this.user_data[y].organization_id);
          }
        }
      } else {
        this.renderSearchResults();        
      }
            
    },

    'capitalize': function(e) {

      if(e.keyCode != 37 && e.keyCode != 39 && e.keyCode != 16 && e.keyCode != 8  && e.keyCode != 91)
      {
        var field_value = this.$(e.currentTarget).val();
        field_value = field_value.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
        this.$(e.currentTarget).val(field_value);
      }      
    },


    'renderSearchResults': function(data) {
      this.switchTo('userSearchResult', {
        number_of_results: this.user_data.length,
        user_data: this.user_data
      });
      this.$('span.spinner').hide();
    },

    'setUserAsRequester': function(e) {

      var ticket = this.ticket();

      var requester_id = this.$(e.currentTarget).find(".user_id").html();

      if ((ticket.status() === "new")){
        ticket.requester({ id: requester_id });
        services.appsTray().hide();
      }

    },

    searchUser: function() {
      this.phone_number = this.$(".phone_number").val().replace(/\s+/g, '');

      if(this.phone_number === "")
      {
        services.notify('Please enter a phone number! (Allowed input:0-9)', "error");
        return;
      }

      if(/\D/.test(this.phone_number))
      {
        services.notify('Please enter numeric characters only for the phone number! (Allowed input:0-9)', "error");
        return;
      }else {
        this.$('span.spinner').show();
        this.ticket().tags().add(this.settings.tag);
      }
      
      this.ajax('searchUserWithPhoneNumber', 'type:user phone:'+this.phone_number);
    },

    createUser: function() {
      var valid = true;
      this.error_messages = [];
      
      //get user values from form
      this.phone_number = this.$(".new_user_phone_number").val().replace(/\s+/g, '');
      this.user_email = this.$(".new_user_email").val();
      this.user_name = this.$(".new_user_name").val();
      this.user_organization = this.$(".new_user_organization").val();
      this.user_organization_id = this.$(".new_user_organization").attr("org_id");
                  
      // validations
      if ((this.phone_number === "")) {valid = false; this.error_messages.push("Please enter a phone number");}
      if (this.phone_number && (/\D/.test(this.phone_number))) {valid = false; this.error_messages.push('Please enter numeric characters only for the phone number! (Allowed input:0-9)');      }
      if ((this.settings.require_email) && !(this.user_email)) {valid = false; this.error_messages.push("Please enter an email address");}
      if ((this.settings.require_email) && (this.user_email) && !(this.checkEmailValidity(this.user_email))) {valid = false;this.error_messages.push("Please enter a valid email address");      }
      if ((this.settings.require_name) && !(this.user_name)) {valid = false;this.error_messages.push("Please enter a name");}
      if ((this.settings.require_organization) && !(this.user_organization)) {valid = false;this.error_messages.push("Please enter a organization");}
            
      //if not valid re-render template with errors
      if (valid === false){ this.renderNewUserTemplate(); return false; } 

      


      if (this.settings.require_organization){
        if (this.user_organization_id && (this.user_organization === this.$(".new_user_organization").attr("org_name"))){
          // existing org was selected and id stored in this.user_organization_id
          //
        }else{
          //create new organisation with selected name
          // name in this.user_organization
          console.log("create new org");
          var new_organization = {};
              new_organization.organization = {};
              new_organization.organization.name = this.user_organization;
              var new_organization_json = JSON.stringify(new_organization);
              this.ajax('createOrganization', new_organization_json);
              return false;
        }
      }

      this.$('span.spinner').show();

      var new_user = {};
          new_user.user = {};
          new_user.user.phone = this.phone_number;
          new_user.user.name = this.user_name;
          if (this.user_email){
            new_user.user.email = this.user_email;            
          }
          new_user.user.organization_id = this.user_organization_id;

      var new_user_json = JSON.stringify(new_user);
      this.ajax('createUser', new_user_json);
      this.$("section[data-main]").html("");
    },

    userCreated: function(data) {
      this.ticket().requester({ id: data.user.id });
      this.$('span.spinner').hide();
      services.appsTray().hide();
    },

    orgCreated: function(data) {
      this.created_organization_id = data.organization.id;
      this.$(".new_user_organization").val(data.organization.name);
      this.$(".new_user_organization").attr("org_id", data.organization.id);
      this.$(".new_user_organization").attr("org_name", data.organization.name);
      this.createUser();
      return false;
    },

    userCreationFail: function(data) {
      services.notify('User creation failed. A user with hte provided email address might already exist.', "error");
      services.appsTray().hide();
    },

    orgCreationFail: function(data) {
      services.notify('Org creation failed');
      services.appsTray().hide();
    },

    checkForEnter: function(e) {
      if(e.keyCode === 13)
      {
        this.searchUser();
      }      
    },

    checkEmailValidity: function(email) {

      var re = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
      return re.test(email);
    
    },

    init: function() {
      this.$('.phone_number').focus();
      this.$('span.spinner').hide();
      services.appsTray().show();
    }
  };
}());
