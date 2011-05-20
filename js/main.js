// Set up mock responses
var exGetUserResponse = {
    firstName: "Wyle E.",
    lastName: "Coyote",
    email: "bugs.bunny@acme.com"
}

var exGetCustomerResponse = {
    customerName: "ACME, Inc.",
    salesRep: "Road Runner"
}

var exGetProductResponse = {
    productName: "Exploding Piano",
    description: "Blow up your nemesis if they play the right tune...",
    accessories: [
        { productName: "Bird Feed", description:"Lure your fowl friend" },
        { productName: "TNT Song Sheet", description:"Such an explosive melody" }
    ]
}

// Set up mock requests
amplify.request.define("getUser", function(settings){
    var vm = ko.mapping.fromJS(exGetUserResponse);
    vm.fullName = ko.dependentObservable(function() { return this.firstName() + ' ' + this.lastName(); }, vm);
    settings.success(vm);
});

amplify.request.define("getCustomer", function(settings){
    settings.success(exGetCustomerResponse);
});

amplify.request.define("getProduct", function(settings){
    settings.success(exGetProductResponse);
});

// Route manager handles loading templates and binding data that's being 'flown' in
var RouteManager = function(vm) {
    var _vm = vm;

    this.WireUp = function(reqKey, ns, template) {
        amplify.request(reqKey, function(data) {
            _vm.activeTemplate(template);
            ko.applyBindings(data, ns);
        });
    };

    this.restSelectRoute = crossroads.addRoute('User', function() {
        this.WireUp("getUser", "user", "User");
    }.bind(this));

    this.aboutRoute = crossroads.addRoute('Customer', function(){
        this.WireUp("getCustomer", "customer", "Customer");
    }.bind(this));

    this.aboutRoute = crossroads.addRoute('Product', function(){
        this.WireUp("getProduct", "product", "Product");
    }.bind(this));

    crossroads.bypassed.add(function(request) {
        _vm.activeTemplate('Default');
    });

    return this;
}

var MainViewModel = function() {
    
    var _routeManager = new RouteManager(this);

    this.menu = ko.observableArray([
        { label: "Show Me a User", link: "User" },
        { label: "Show Me a Customer", link: "Customer" },
        { label: "Show Me a Product", link: "Product" },
    ]);

    this.activeTemplate = ko.observable("Default");

    this.templateOption = function() {
        return this.activeTemplate();
    }.bind(this);

    this.handleHashChange = function(newHash, oldHash) {
        crossroads.parse(newHash);
    };

    this.onNavigation = function(hash) {
        hasher.setHash(hash);
        return false;
    };

    hasher.changed.add(this.handleHashChange);
}

$(function() {
    ko.externaljQueryTemplateEngine.setOptions({
        templateUrl: "template",
        templatePrefix: "",
        templateSuffix: ".html"
    });
    window.viewModel = new MainViewModel();
    ko.applyBindings(viewModel);
    hasher.init();
    var hash = hasher.getHash();
    if(hash) {
        crossroads.parse(hash);
    }
});
