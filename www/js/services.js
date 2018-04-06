'use strict';

angular.module('dmaware.services', [])
    .constant("baseURL","https://dmaware-rest.herokuapp.com/")
    //.constant("baseURL","http://localhost:3000/")

    .service('userService', ['$http', '$rootScope', '$state', 'baseURL', function($http, $rootScope, $state, baseURL) {
       
        var currentUser = {};
        var currentUserStale;
            
        var fullname = '';
        
        this.getUserFullname = function() {
            return fullname;
        };
        
        this.getCurrentUserId = function() {
            return currentUser._id;
        };
        
        this.getCurrentUser = function(promise) {
            var response = null;
            console.log("Attempting to get current user...currentUserStale: " + currentUserStale);
            console.log("Current user is: ");
            console.log(currentUser);
            if(currentUserStale) {
                currentUserStale = false;
                return $http({
                   url: baseURL + 'users/'+ currentUser._id,
                    method: 'GET',
                    headers: {
                        'content-type': 'application/json' 
                    }
                });
                
            } else {
                if(promise) {
                    response = $q.when(currentUser);
                } else {
                    response = currentUser;
                }
                return response;
            }            
        };
        
               
        this.setCurrentUser = function(user) {
            currentUser = user;
            console.log("Added new current user:");
            console.log(user);
            currentUserStale = false;
            fullname = user.first_name + " " + user.last_name;
        };
        
        this.setCurrentUserStale = function() {
            console.log("Setting current user stale");
            currentUserStale = true;
            console.log("currentUserStale: " + currentUserStale);
        };        
        
        this.cleanupLoggedOutUser = function() {
            currentUser = {};
            
        };
        
        this.getUserSpells = function(charclass, level) {
            console.log('Using string= ' + baseURL + 'spells?character_class=' + charclass + '&level=' + level);
            return $http({
                url: baseURL + 'spells?character_class=' + charclass + '&level=' + level,
                method: 'GET',
                headers: {
                    'content-type': 'application/json' 
                }
            });
        };
        
        this.getUserCantrips = function(charclass) {
            console.log('Using string= ' + baseURL + 'spells?character_class=' + charclass + '&level=0');
            return $http({
                url: baseURL + 'spells?character_class=' + charclass + '&level=0',
                method: 'GET',
                headers: {
                    'content-type': 'application/json' 
                }
            });
        };
        
      }])

    .service('authService', ['$http', 'baseURL', '$state', '$ionicPopup', 'userService', 'coreDataService', function($http, baseURL, $state, $ionicPopup,userService, coreDataService) {
        var authToken = undefined;
        var isAuthenticated = false;  
        var isAdmin = false;
        
        this.isUserAuthenticated = function() {
            return isAuthenticated;
        };
        
        this.isAdmin = function() {
            return isAdmin;
        };
        
        this.loginOnly = function (loginData) {
            //make http request and return promise:
            return $http({
                url: baseURL + 'users/login',
                method: 'POST',
                headers: {
                    'content-type': 'application/json' 
                },
                data: loginData
            });  
        };
        
        var showPopup = function(message) {
            var alertPopup = $ionicPopup.alert({
                    title: 'Login failed!',
                    template: 'Please check your credentials - ' + message,
                    okType: 'button-assertive' // Appears red to inidicate error
                });
                
            alertPopup.then(function(res) {
                console.log('done with popup');
            });
        };
        
        this.login = function(loginData) {
            //make http request:
            $http({
                url: baseURL + 'users/login',
                method: 'POST',
                headers: {
                    'content-type': 'application/json' 
                },
                data: loginData
            }).then(function(response) {
                console.log(response);
                internalSetUserCredentials({username:loginData.username, token: response.data.token, fullname: response.data.fullname, userId: response.data.userId, admin: response.data.admin});                 
                console.log("User " + response.data.fullname + " has been authenticated successfully.");
                
                //retrieve user and store in scope:
                $http({
                    url: baseURL + 'users/' + response.data.userId,
                    method: 'GET',
                    headers: {
                        'content-type': 'application/json' 
                    }
                }).then(function(response) {
                    console.log("Retrieved the user from the API with value: ");
                    console.log(response);
                    console.log("\n\nSETTING CURRENT USER TO: " );
                    console.log(response.data);
                    userService.setCurrentUser(response.data);   
                    coreDataService.populateCoreData();
                });   
                
                $state.go("app.intro");
            }, function(errResponse) {
                isAuthenticated = false;            
                //showPopup(errResponse.data.err.message);
                $state.go("app.intro");
            });
        };        
        
        var internalLogin = this.login;
        
        this.logout = function() {
            //make http request:
            $http({
                url: baseURL + 'users/logout',
                method: 'POST',
                headers: {
                    'content-type': 'application/json' 
                }               
            }).then(function(response) {
                console.log(response);                 
                isAuthenticated = false;
                destroyUserCredentials();
                $state.go("app.intro");
            }, function(errResponse) {           
                var message = '\
                <div class="ngdialog-message">\
                <div><h3>Logout Unsuccessful</h3></div>' +
                  '<div><p>' +  response.data.err.message + '</p><p>' +
                    response.data.err.name + '</p></div>' +
                '<div class="ngdialog-buttons">\
                    <button type="button" class="ngdialog-button ngdialog-button-primary" ng-click=confirm("OK")>OK</button>\
                </div>'

            });
            
        };
        
        this.registerOnly = function(registerData) {
            //make http request and return promise:
            console.log("Attempting to register user with data:");
            console.log(registerData);
            
            return $http({
                url: baseURL + 'users/register',
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                data: registerData
            });
        };
        
        this.register = function(registerData) {
            //make http request
            console.log(registerData);
            $http({
                url: baseURL + 'users/register',
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                data: registerData
            }).then(function(response) {
                console.log("successfully registered a user.");
                
                console.log("will attempt to log user in with username: " + registerData.username + " and password: " + registerData.password);
                internalLogin({username:registerData.username, password:registerData.password});
                var message = '\
                <div class="ngdialog-message">\
                <div><h3>Registration Successful</h3></div>' +
                '<div class="ngdialog-buttons">\
                    <button type="button" class="ngdialog-button ngdialog-button-primary" ng-click=confirm(1)>OK</button>\
                </div>'
            
                
            }, function(response) {
                console.log("failed to registered a user.");
                $scope.showRegLoader = true;
                var message = '\
                <div class="ngdialog-message">\
                <div><h3>Login Unsuccessful</h3></div>' +
                  '<div><p>' +  response.data.err.message + '</p><p>' +
                    response.data.err.name + '</p></div>' +
                '<div class="ngdialog-buttons">\
                    <button type="button" class="ngdialog-button ngdialog-button-primary" ng-click=confirm(1)>OK</button>\
                </div>'
            
            });
        };
        
        this.setUserCredentials = function(credentials) {
            isAuthenticated = true;
            authToken = credentials.token;
            isAdmin = credentials.admin;

            // Set the token as header for your requests!
            $http.defaults.headers.common['x-access-token'] = authToken;
            console.log("user credentials have been set \nisAuthenticated: " + 
                        isAuthenticated + "\nisAdmin: " + isAdmin + "\nusername: " + credentials.username + "\nauthToken: " + 
                        authToken + "\nfullname: " + credentials.fullname + "\nuserId: " + credentials.userId);
        };
        
        var internalSetUserCredentials = this.setUserCredentials;
        
        function destroyUserCredentials() {
            isAuthenticated = false;
            authToken = '';
                        
            userService.cleanupLoggedOutUser();

            // Set the token as header for your requests!
            $http.defaults.headers.common['x-access-token'] = authToken;
            console.log("user credentials have been destroyed.");
        }; 
        
        this.isLoggedIn = function() {
            return isAuthenticated;
        };
    }])

    .service('coreDataService', ['$http', 'baseURL', '$state', 'userService', function($http, baseURL, $state, userService) {
        var abilityModifiers = [];
        var proficiencyBonuses = [];
        var skillLookup = [];
        var spellSlotsLookup = [];
        var usersCharacters = [];
        var races = [];
        var classes = [];
        var alignments = [];
        
        this.getUsersCharacters = function() {
            return usersCharacters;
        };        
        
        this.getAbilityModifiers = function() {
            return abilityModifiers;  
        };
        
        this.getProficiencyBonuses = function() {
            return proficiencyBonuses;
        };
        
        this.getSkillLookup = function() {
            return skillLookup;
        };
        
        this.getSpellSlotLookup = function() {
            return spellSlotsLookup;
        };
        
        this.getRaces = function() {
            return races;
        };
        
        this.getClasses = function() {
            return classes;
        };
        
        this.getAlignments = function() {
            return alignments;
        };
        
        this.populateCoreData = function() {
            //retrieve ability modifiers:
            $http({
                url: baseURL + 'ability_score_modifiers/',
                method: 'GET',
                headers: {
                    'content-type': 'application/json' 
                }
            }).then(function(response) {
                console.log("Retrieved the ability score modifiers from the API: ");
                console.log(response.data);
                abilityModifiers = response.data;
            });
            
            //retrieve proficiency bonuses:
            $http({
                url: baseURL + 'proficiency_bonuses/', 
                method: 'GET',
                headers: {
                    'content-type': 'application/json'
                }
            }).then(function(response) {                
                console.log("Retrieved the proficiency bonuses from the API: ");
                console.log(response.data);
                proficiencyBonuses = response.data;
            });
            
            //retrieve skill lookups:
            $http({
                url: baseURL + 'skill_lookups/', 
                method: 'GET',
                headers: {
                    'content-type': 'application/json'
                }
            }).then(function(response) {                
                console.log("Retrieved the skill lookups from the API: ");
                console.log(response.data);
                skillLookup = response.data;
            });
            
            //retrieve spell slot lookups:
            $http({
                url: baseURL + 'spell_slots/', 
                method: 'GET',
                headers: {
                    'content-type': 'application/json'
                }
            }).then(function(response) {                
                console.log("Retrieved the spell slot lookups from the API: ");
                console.log(response.data);
                spellSlotsLookup = response.data;
            });
                    
            //retrieve users characters:
            $http({
                url: baseURL + 'characters?user=' + userService.getCurrentUserId(), 
                method: 'GET',
                headers: {
                    'content-type': 'application/json'
                }
            }).then(function(response) {                
                console.log("Retrieved the current users charaacters from the API: ");
                console.log(response.data);
                usersCharacters = response.data;
            });
            
            //retrieve races:
            $http({
                url: baseURL + 'races', 
                method: 'GET',
                headers: {
                    'content-type': 'application/json'
                }
            }).then(function(response) {                
                console.log("Retrieved the all races from the API: ");
                console.log(response.data);
                races = response.data;
            });
            
            //retrieve classes:
            $http({
                url: baseURL + 'character_classes', 
                method: 'GET',
                headers: {
                    'content-type': 'application/json'
                }
            }).then(function(response) {                
                console.log("Retrieved the all classes from the API: ");
                console.log(response.data);
                classes = response.data;
            });
            
            //retrieve alignments:
            $http({
                url: baseURL + 'alignments', 
                method: 'GET',
                headers: {
                    'content-type': 'application/json'
                }
            }).then(function(response) {                
                console.log("Retrieved the all alignments from the API: ");
                console.log(response.data);
                alignments = response.data;
            });
        }
        
    }])                    

    .service('classService', ['$http', '$rootScope', '$state', '$q', 'baseURL', 'coreDataService', function($http, $rootScope, $state, $q, baseURL, coreDataService) {
        
        var currentClass;
        
        this.getCurrentClass = function() {
            return currentClass;
        };
        
        this.getAllClasses = function() {
            return coreDataService.getClasses();
        };
        
        this.setCurrentClass = function(myClass) {
            currentClass = myClass;
        };
        
        this.getCharClassByName = function(name) {
            console.log('Using string= ' + baseURL + 'character_classes?name=' + name);
            return $http({
                url: baseURL + 'character_classes?name=' + name,
                method: 'GET',
                headers: {
                    'content-type': 'application/json' 
                }
            });
        };
    
    }])

    .service('raceService', ['$http', '$rootScope', '$state', '$q', 'baseURL', 'coreDataService', function($http, $rootScope, $state, $q, baseURL, coreDataService) {
        
        var currentRace;
        
        this.getAllRaces = function() {
            return coreDataService.getRaces();
        }
        
        this.getCurrentRace = function() {
            return currentRace;
        };
        
        this.setCurrentRace = function(myRace) {
            currentRace = myRace;
        };
        
        this.getRaceByName = function(name) {
            console.log('Using string= ' + baseURL + 'races?name=' + name);
            return $http({
                url: baseURL + 'races?name=' + name,
                method: 'GET',
                headers: {
                    'content-type': 'application/json' 
                }
            });
        };
    
    }])

    .service('characterService', ['$http', '$rootScope', '$state', '$q', 'baseURL', 'raceService', 'classService', 'coreDataService', 'userService', function($http, $rootScope, $state, $q, baseURL, raceService, classService, coreDataService, userService) {
        
        var currentCharacter;
        
        this.getCurrentChar = function() {
            return currentCharacter;
        };
        
        this.setCurrentChar = function(myChar) {
            currentCharacter = myChar;
        };
        
        this.deleteCharacter = function(charId) {
            console.log("Received delete request for character: " + charId);
            $http({
                url: baseURL + 'characters/' + charId, 
                method: 'DELETE',
                headers: {
                    'content-type': 'application/json'
                }
            }).then(function(response) {                
                console.log("Deleted the charaacter from the API: ");
                console.log(response.data);
                coreDataService.populateCoreData();
            });
        };
        
        this.generateCharacter = function(characterForm) {
            console.log("Building character from form ");
            console.log(characterForm);
            
            var curClass = classService.getCurrentClass();
            var curRace = raceService.getCurrentRace();
            
            //first calculate racial ability bonuses:
            var race = raceService.getCurrentRace();
            characterForm.str += getRacialBonus("STRENGTH", race);
            characterForm.dex += getRacialBonus("DEXTERITY", race);
            characterForm.con += getRacialBonus("CONSTITUTION", race);
            characterForm.wis += getRacialBonus("WISDOM", race);
            characterForm.int += getRacialBonus("INTELLIGENCE", race);
            characterForm.cha += getRacialBonus("CHARISMA", race);
            
            //now determine ability modifiers:
            characterForm.strmod = getModifier(characterForm.str);
            characterForm.dexmod = getModifier(characterForm.dex);
            characterForm.conmod = getModifier(characterForm.con);
            characterForm.wismod = getModifier(characterForm.wis);
            characterForm.intmod = getModifier(characterForm.int);
            characterForm.chamod = getModifier(characterForm.cha);
            
            
            //set proficiency bonus:
            characterForm.probonus = getProfBonus(curClass, 1);
            
            var classSvBonuses = curClass.saving_throw_proficiency;
            
            //set saving throw proficiency and modifiers:
            if(classSvBonuses.includes("Strength")) {
                characterForm.strsvmod = characterForm.strmod + characterForm.probonus;
                characterForm.strsvpro = true;
            } else {
                characterForm.strsvmod = characterForm.strmod;
                characterForm.strsvpro = false;
            }
            
            if(classSvBonuses.includes("Dexterity")) {
                characterForm.dexsvmod = characterForm.dexmod + characterForm.probonus;
                characterForm.dexsvpro = true;
            } else {
                characterForm.dexsvmod = characterForm.dexmod;
                characterForm.dexsvpro = false;
            }
            
            if(classSvBonuses.includes("Constitution")) {
                characterForm.consvmod = characterForm.conmod + characterForm.probonus;
                characterForm.consvpro = true;
            } else {
                characterForm.consvmod = characterForm.conmod;
                characterForm.consvpro = false;
            }
            
            if(classSvBonuses.includes("Wisdom")) {
                characterForm.wissvmod = characterForm.wismod + characterForm.probonus;
                characterForm.wissvpro = true;
            } else {
                characterForm.wissvmod = characterForm.wismod;
                characterForm.wissvpro = false;
            }
            
            if(classSvBonuses.includes("Intelligence")) {
                characterForm.intsvmod = characterForm.intmod + characterForm.probonus;
                characterForm.intsvpro = true;
            } else {
                characterForm.intsvmod = characterForm.intmod;
                characterForm.intsvpro = false;
            }
            
            if(classSvBonuses.includes("Charisma")) {
                characterForm.chasvmod = characterForm.chamod + characterForm.probonus;
                characterForm.chasvpro = true;
            } else {
                characterForm.chasvmod = characterForm.chamod;
                characterForm.chasvpro = false;
            }
                        
            //set hit dice, hit points and max hit points:
            characterForm.hitdietotal = 1;
            characterForm.hitdie = 'd' + curClass.hit_die;
            characterForm.hptemp = 0;
            characterForm.hpcurr = parseInt(curClass.hit_die) + characterForm.conmod;
            characterForm.hpmax = characterForm.hpcurr;
            
            //create attacks:
            characterForm.attackString = generateAttackString(characterForm);
            
            console.log("FINISHED");
            console.log(characterForm);  
            
            //now start the actual build:
            var spellcaster = true;
            
            if(getSlotsAsString(characterForm) == "") 
                spellcaster = false;             
            
            if(spellcaster) {
                $http({
                    url: baseURL + 'slots/',
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json' 
                    },
                    data: getSlotsAsString(characterForm)
                }).then(function(response) {                    
                    characterForm.slotIds = getSlotIdString(response.data);       
                    //create spellbook:
                    characterForm.spellbookString = generateSpellbookString(characterForm);
                    
                    //now build spellbook:
                    $http({
                        url: baseURL + 'spellbooks/',
                        method: 'POST',
                        headers: {
                            'content-type': 'application/json' 
                        },
                        data: characterForm.spellbookString
                    }).then(function(spellbookResponse) { 
                        characterForm.spellBookId = spellbookResponse.data._id;
                        
                        //build inventory:
                        $http({
                            url: baseURL + 'inventories/buildFromItems/',
                            method: 'POST',
                            headers: {
                                'content-type': 'application/json' 
                            },
                            data: getInventoryString(characterForm.equipment)
                        }).then(function(invResponse) { 
                            characterForm.inventoryId = invResponse.data._id;
                            //build attacks:
                            $http({
                                url: baseURL + 'attacks/',
                                method: 'POST',
                                headers: {
                                    'content-type': 'application/json' 
                                },
                                data: characterForm.attackString
                            }).then(function(attResponse) { 
                                characterForm.attackIds = getAttackIds(attResponse.data);
                                //build skills:
                                $http({
                                    url: baseURL + 'skills/',
                                    method: 'POST',
                                    headers: {
                                        'content-type': 'application/json' 
                                    },
                                    data: generateSkillsString(characterForm)
                                }).then(function(skillResponse) { 
                                    characterForm.skillIds = getSkillIds(skillResponse.data);
                                    
                                    //last of all, build the character string and save it:
                                    var str = '{'
                                    str += '"name": "' + characterForm.character + '", ';
                                    str += '"character_class": "' + classService.getCurrentClass()._id + '", ';
                                    str += '"character_level": 1, ';
                                    str += '"race": "' + raceService.getCurrentRace()._id + '", ';
                                    str += '"experience_points": 0, ';
                                    str += '"strength": ' + characterForm.str + ', ';                                    
                                    str += '"dexterity": ' + characterForm.dex  + ', ';
                                    str += '"constitution": ' + characterForm.con + ', ';
                                    str += '"wisdom": ' + characterForm.wis + ', ';
                                    str += '"intelligence": ' + characterForm.int + ', ';
                                    str += '"charisma": ' + characterForm.cha + ', ';
                                    str += '"strength_modifier": ' + characterForm.strmod + ', ';                                    
                                    str += '"dexterity_modifier": ' + characterForm.dexmod  + ', ';
                                    str += '"constitution_modifier": ' + characterForm.conmod + ', ';
                                    str += '"wisdom_modifier": ' + characterForm.wismod + ', ';
                                    str += '"intelligence_modifier": ' + characterForm.intmod + ', ';
                                    str += '"charisma_modifier": ' + characterForm.chamod + ', ';
                                    str += '"proficiency_bonus": ' + characterForm.probonus + ', ';
                                    str += '"hit_point_maximum": ' + characterForm.hpmax + ', ';
                                    str += '"hit_points": ' + characterForm.hpcurr + ', ';
                                    str += '"hit_points_temporary": ' + characterForm.hptemp + ', ';
                                    str += '"hit_die_type": ' + parseInt(characterForm.hitdie.substr(1)) + ', ';
                                    str += '"hit_dice_count": ' + characterForm.hitdietotal + ', ';
                                    str += '"speed_base": ' + raceService.getCurrentRace().base_speed + ', ';                                    
                                    str += '"speed_current": ' + raceService.getCurrentRace().base_speed + ', ';
                                    str += '"saving_throw_modifier_strength": ' + characterForm.strsvmod + ', ';
                                    str += '"saving_throw_modifier_dexterity": ' + characterForm.dexsvmod + ', ';
                                    str += '"saving_throw_modifier_constitution": ' + characterForm.consvmod + ', ';
                                    str += '"saving_throw_modifier_wisdom": ' + characterForm.wissvmod + ', ';
                                    str += '"saving_throw_modifier_intelligence": ' + characterForm.intsvmod + ', ';
                                    str += '"saving_throw_modifier_charisma": ' + characterForm.chasvmod + ', ';
                                    str += '"skills": ' + characterForm.skillIds + ', ';
                                    str += '"inventory": "' + characterForm.inventoryId + '", ';
                                    str += '"armor_class": 10, ';
                                    str += '"alignment": "' + characterForm.alignment + '", ';
                                    str += '"langauge": ' + buildStringJSON(characterForm.languages) + ', ';
                                    str += '"saving_throw_proficiency_strength": ' + characterForm.strsvpro + ', ';
                                    str += '"saving_throw_proficiency_dexterity": ' + characterForm.dexsvpro + ', ';
                                    str += '"saving_throw_proficiency_constitution": ' + characterForm.consvpro + ', ';
                                    str += '"saving_throw_proficiency_wisdom": ' + characterForm.wissvpro + ', ';
                                    str += '"saving_throw_proficiency_intelligence": ' + characterForm.intsvpro + ', ';
                                    str += '"saving_throw_proficiency_charisma": ' + characterForm.chasvpro + ', ';
                                    str += '"attacks": ' + characterForm.attackIds + ', ';
                                    str += '"attack_count": 1, ';
                                    str += '"proficiencies": ' + buildProficiencyArray(characterForm) + ', ';
                                    
                                    var pass = 10 + characterForm.wismod;
                                    if(characterForm.wissvpro) 
                                        pass += characterForm.probonus;
                                    str += '"passive_perception": ' + pass + ', ';                                    
                                    str += '"spellbook": ["' + characterForm.spellBookId + '"], ';
                                    str += '"user": "' + userService.getCurrentUser()._id + '"';    
                                    str += '}';
                                    
                                    console.log("THE CHARACTER STRING");
                                    console.log(str);
                                    
                                    $http({
                                        url: baseURL + 'characters/',
                                        method: 'POST',
                                        headers: {
                                            'content-type': 'application/json' 
                                        },
                                        data: str
                                    }).then(function(charResponse) { 
                                        console.log("Successfully created Character");
                                        console.log(charResponse);
                                        //reload current user's characters
                                        coreDataService.populateCoreData();
                                    });                             
                                });                                
                            });                            
                        });
                    });                    
                });
            } else {
                //TODO: handle non-spellcasters
                console.log("Non-spellcaster");
                //build inventory:
                $http({
                    url: baseURL + 'inventories/buildFromItems/',
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json' 
                    },
                    data: getInventoryString(characterForm.equipment)
                }).then(function(invResponse) { 
                    characterForm.inventoryId = invResponse.data._id;
                    //build attacks:
                    $http({
                        url: baseURL + 'attacks/',
                        method: 'POST',
                        headers: {
                            'content-type': 'application/json' 
                        },
                        data: characterForm.attackString
                    }).then(function(attResponse) { 
                        characterForm.attackIds = getAttackIds(attResponse.data);
                        //build skills:
                        $http({
                            url: baseURL + 'skills/',
                            method: 'POST',
                            headers: {
                                'content-type': 'application/json' 
                            },
                            data: generateSkillsString(characterForm)
                        }).then(function(skillResponse) { 
                            characterForm.skillIds = getSkillIds(skillResponse.data);

                            //last of all, build the character string and save it:
                            var str = '{'
                            str += '"name": "' + characterForm.character + '", ';
                            str += '"character_class": "' + classService.getCurrentClass()._id + '", ';
                            str += '"character_level": 1, ';
                            str += '"race": "' + raceService.getCurrentRace()._id + '", ';
                            str += '"experience_points": 0, ';
                            str += '"strength": ' + characterForm.str + ', ';                                    
                            str += '"dexterity": ' + characterForm.dex  + ', ';
                            str += '"constitution": ' + characterForm.con + ', ';
                            str += '"wisdom": ' + characterForm.wis + ', ';
                            str += '"intelligence": ' + characterForm.int + ', ';
                            str += '"charisma": ' + characterForm.cha + ', ';
                            str += '"strength_modifier": ' + characterForm.strmod + ', ';                                    
                            str += '"dexterity_modifier": ' + characterForm.dexmod  + ', ';
                            str += '"constitution_modifier": ' + characterForm.conmod + ', ';
                            str += '"wisdom_modifier": ' + characterForm.wismod + ', ';
                            str += '"intelligence_modifier": ' + characterForm.intmod + ', ';
                            str += '"charisma_modifier": ' + characterForm.chamod + ', ';
                            str += '"proficiency_bonus": ' + characterForm.probonus + ', ';
                            str += '"hit_point_maximum": ' + characterForm.hpmax + ', ';
                            str += '"hit_points": ' + characterForm.hpcurr + ', ';
                            str += '"hit_points_temporary": ' + characterForm.hptemp + ', ';
                            str += '"hit_die_type": ' + parseInt(characterForm.hitdie.substr(1)) + ', ';
                            str += '"hit_dice_count": ' + characterForm.hitdietotal + ', ';
                            str += '"speed_base": ' + raceService.getCurrentRace().base_speed + ', ';                                    
                            str += '"speed_current": ' + raceService.getCurrentRace().base_speed + ', ';
                            str += '"saving_throw_modifier_strength": ' + characterForm.strsvmod + ', ';
                            str += '"saving_throw_modifier_dexterity": ' + characterForm.dexsvmod + ', ';
                            str += '"saving_throw_modifier_constitution": ' + characterForm.consvmod + ', ';
                            str += '"saving_throw_modifier_wisdom": ' + characterForm.wissvmod + ', ';
                            str += '"saving_throw_modifier_intelligence": ' + characterForm.intsvmod + ', ';
                            str += '"saving_throw_modifier_charisma": ' + characterForm.chasvmod + ', ';
                            str += '"skills": ' + characterForm.skillIds + ', ';
                            str += '"inventory": "' + characterForm.inventoryId + '", ';
                            str += '"armor_class": 10, ';
                            str += '"alignment": "' + characterForm.alignment + '", ';
                            str += '"langauge": ' + buildStringJSON(characterForm.languages) + ', ';
                            str += '"saving_throw_proficiency_strength": ' + characterForm.strsvpro + ', ';
                            str += '"saving_throw_proficiency_dexterity": ' + characterForm.dexsvpro + ', ';
                            str += '"saving_throw_proficiency_constitution": ' + characterForm.consvpro + ', ';
                            str += '"saving_throw_proficiency_wisdom": ' + characterForm.wissvpro + ', ';
                            str += '"saving_throw_proficiency_intelligence": ' + characterForm.intsvpro + ', ';
                            str += '"saving_throw_proficiency_charisma": ' + characterForm.chasvpro + ', ';
                            str += '"attacks": ' + characterForm.attackIds + ', ';
                            str += '"attack_count": 1, ';
                            str += '"proficiencies": ' + buildProficiencyArray(characterForm) + ', ';

                            var pass = 10 + characterForm.wismod;
                            if(characterForm.wissvpro) 
                                pass += characterForm.probonus;
                            str += '"passive_perception": ' + pass + ', ';                                    
                            str += '"spellbook": ["' + characterForm.spellBookId + '"], ';
                            str += '"user": "' + userService.getCurrentUser()._id + '"';    
                            str += '}';

                            console.log("THE CHARACTER STRING");
                            console.log(str);

                            $http({
                                url: baseURL + 'characters/',
                                method: 'POST',
                                headers: {
                                    'content-type': 'application/json' 
                                },
                                data: str
                            }).then(function(charResponse) { 
                                console.log("Successfully created Character");
                                console.log(charResponse);
                                //reload current user's characters
                                coreDataService.populateCoreData();
                            }); 
                        });
                    });
                });
            }
        };
        
        function buildProficiencyArray(form) {
            var pro = '['
            //languages:
            for(var i = 0; i < form.languages.length; i++) {
                pro += '"' + form.languages[i] + '", ';
            }
            
            //armor proficiencies:
            var arm = classService.getCurrentClass().armor_proficiency;
            for(var i = 0; i < arm.length; i++) {
                pro += '"' + arm[i] + '", ';
            }
            
            //weapon proficiencies:
            var weapon = classService.getCurrentClass().weapon_proficiency;
            for(var i = 0; i < weapon.length; i++) {
                pro += '"' + weapon[i] + '", ';
            }            
            
            pro = pro.slice(0, -2);
            pro += ']'
            return pro;
        };
        
        function buildStringJSON(ary) {
            var items = '[';
            for(var i = 0; i < ary.length; i++) {
                items += '"' + ary[i] + '", ';
            }
            
            items = items.slice(0, -2);
            items += ']';
            
            return items;
        };
        
        function getSkillIds(skills) {
            var skillId = '[';
            for(var i = 0; i < skills.length; i++) {
                skillId += '"' + skills[i]._id + '", ';
            }
            
            skillId = skillId.slice(0, -2);
            skillId += ']';
            
            return skillId;            
        };
        
        function getAttackIds(attacks) {
            var attId = '[';
            for(var i = 0; i < attacks.length; i++) {
                attId += '"' + attacks[i]._id + '", ';
            }
            
            attId = attId.slice(0, -2);
            attId += ']';
            
            return attId;            
        };
        
        function getInventoryString(items) {
            var ids = '{"items": [';
            
            for(var i = 0; i < items.length; i++) {
                ids += '{"_id": "' + items[i]._id + '", "weight":' + items[i].weight + '}, ';
            }
            
            ids = ids.slice(0, -2);
            ids += ']}';
            
            return ids;
        };
        
        function getSlotIdString(slots) {
            var ids = '[';
            
            for(var i = 0; i < slots.length; i++) {
                ids += '"' + slots[i]._id + '",';
            }
            
            ids = ids.slice(0, -1);
            ids += ']';
            
            return ids;
        };
        
        function generateAttackString(form) {
            var weapons = getDamageInducingItems(form.equipment);
            var attackString = '[';
            
            for(var i = 0; i < weapons.length; i++) {
                attackString += '{"name": "' + weapons[i].name + '", "damage_type": "' + weapons[i].damage_type + '", "multiplier": ' + weapons[i].multiplier + ', "die_type": ' + weapons[i].die_type + '}, ';
            }
            
            attackString = attackString.slice(0, -2);
            attackString += ']';
            
            return attackString;         
        };
        
        function getDamageInducingItems(items) {
            var weapons = [];
            
            for(var i = 0; i < items.length; i++) {
                if(items[i].damage_inducing) 
                    weapons.push(items[i]);
            }
            
            return weapons;
        }
        
        function generateSpellbookString(form) {
            var spellbookString = ''; 
            spellbookString += '{ "spell_save_dc": ' + getSpellSaveDC(form) + ', ';
            spellbookString += '"spell_attack_bonus": ' + getSpellAttackBonus(form) + ', ';
            spellbookString += '"spellbook_spells": ' + getSpellsAsString(form) + ', ';
            spellbookString += '"slots": ' + form.slotIds + '}';
            
            console.log(spellbookString);
                    
            return spellbookString;
        };
        
        function getSlotsAsString(form) {
            
            var slotString = '[';
            
            //retrieve spell slot lookups:
            var slots = getSlotLookups(form.characterclass, form.level);
            
            if(slots == null)
                return "";
                
            slotString += '{ "level": 1, "spell_count": "' + slots.first_lvl + '", "used":0}, ';
            slotString += '{ "level": 2, "spell_count": "' + slots.second_lvl + '", "used":0}, ';
            slotString += '{ "level": 3, "spell_count": "' + slots.third_lvl + '", "used":0}, ';
            slotString += '{ "level": 4, "spell_count": "' + slots.fourth_lvl + '", "used":0}, ';
            slotString += '{ "level": 5, "spell_count": "' + slots.fifth_lvl + '", "used":0}, ';
            slotString += '{ "level": 6, "spell_count": "' + slots.sixth_lvl + '", "used":0}, ';
            slotString += '{ "level": 7, "spell_count": "' + slots.seventh_lvl + '", "used":0}, ';
            slotString += '{ "level": 8, "spell_count": "' + slots.eighth_lvl + '", "used":0}, ';
            slotString += '{ "level": 9, "spell_count": "' + slots.ninth_lvl + '", "used":0}';
            
            slotString += ']';
            return slotString;
        };
        
        function getSpellsAsString(form) {
            if(form.spells != null && form.spells.length > 0) {
                var spellString = '[';

                var spells = form.spells;

                for(var i = 0; i < spells.length; i++) {
                    spellString += '"' + spells[i]._id + '", ';
                }

                spellString = spellString.slice(0, -2);

                spellString += ']';

                return spellString;
            } else {
                return "[]";
            }
        };
        
        function getSpellSaveDC(form) {
            var castingAbility = classService.getCurrentClass().spellcasting_ability;
            var bonus = form.probonus;
            var saveDC = 0;
            
            switch(castingAbility) {
                case "Strength":
                    saveDC = 8 + bonus + form.strmod;
                    break;
                case "Desterity":
                    saveDC = 8 + bonus + form.dexmod;
                    break;
                case "Constitution":
                    saveDC = 8 + bonus + form.conmod;
                    break;
                case "Wisdom":
                    saveDC = 8 + bonus + form.wismod;
                    break;
                case "Intelligence":
                    saveDC = 8 + bonus + form.intmod;
                    break;
                case "Charisma":
                    saveDC = 8 + bonus + form.chamod;
                    break;
            }
            return saveDC;
        };
        
        function getSpellAttackBonus(form) {
            var castingAbility = classService.getCurrentClass().spellcasting_ability;
            var bonus = form.probonus;
            var attackbonus = 0;
            
            switch(castingAbility) {
                case "Strength":
                    attackbonus = bonus + form.strmod;
                    break;
                case "Desterity":
                    attackbonus = bonus + form.dexmod;
                    break;
                case "Constitution":
                    attackbonus = bonus + form.conmod;
                    break;
                case "Wisdom":
                    attackbonus = bonus + form.wismod;
                    break;
                case "Intelligence":
                    attackbonus = bonus + form.intmod;
                    break;
                case "Charisma":
                    attackbonus = bonus + form.chamod;
                    break;
            }
            return attackbonus;
        };
        
        function getSlotLookups(charClass, level) {            
            var lookup = coreDataService.getSpellSlotLookup();
            var slots = null;
            
            for(var i = 0; i < lookup.length; i++) {
                if(lookup[i].level == level && lookup[i].character_class == charClass) {
                    slots = lookup[i];
                    break;
                }
            }
            return slots;
        }
        
        function generateSkillsString(form) {
            var lookup = coreDataService.getSkillLookup();
            var skillString = '[';   
            
            lookup.forEach(function(skill) {
                var isProficient = hasProficiency(skill.name, form);
                skillString += '{ "name": "' + skill.name + '", "constrolling_ability": "' + 
                    skill.controlling_ability + '", "proficiency":' + isProficient + 
                    ', "bonus": ' + getBonus(skill.controlling_ability, isProficient, form) + '}, ';
            });
            skillString = skillString.slice(0, -2);
            skillString += ']';
            console.log("SKILLSTRING: " + skillString);
            return skillString;
        };
        
        function hasProficiency(ability, form) {
            var abilities = form.skills;
            var proficient = false;
            
            for(var i = 0; i < abilities.length; i++) {
                if(abilities[i] === ability) {
                    proficient = true;
                    break;
                }
            }            
            return proficient;
        };
        
        function getBonus(ability, proficient, form) {
            var bonus = 0;
            
            switch(ability) {
                case 'STRENGTH':
                    bonus += form.strmod;
                    if(proficient) bonus += form.probonus;
                    break;
                    
                case 'DEXTERITY':
                    bonus += form.dexmod;
                    if(proficient) bonus += form.probonus;
                    break;
                    
                case 'CONSTITUTION':
                    bonus += form.conmod;
                    if(proficient) bonus += form.probonus;
                    break;
                    
                case 'WISDOM':
                    bonus += form.wismod;
                    if(proficient) bonus += form.probonus;
                    break;
                    
                case 'INTELLIGENCE':
                    bonus += form.intmod;
                    if(proficient) bonus += form.probonus;
                    break;
                    
                case 'CHARISMA':
                    bonus += form.chamod;
                    if(proficient) bonus += form.probonus;
                    break;                    
            }            
            
            return bonus;
        };
            
        function getRacialBonus(ability, race) {
            var bonus = 0;
            var scores = race.ability_score_increase;
            
            for(var i = 0; i < scores.length; i++) {
                if(scores[i].ability == ability) {
                    bonus = scores[i].increase;
                }
            }
            return bonus;
        };
        
        function getModifier(score) {
            var mod = 0;
            var modifiers = coreDataService.getAbilityModifiers();
            
            for(var i = 0; i < modifiers.length; i++) {
                if(modifiers[i].score == score) {
                    mod = modifiers[i].increase;
                    break;
                }
            }
            
            return mod;
        };
        
        function getProfBonus(cls, lvl) {
            var bonuses = coreDataService.getProficiencyBonuses();
            var curClass = classService.getCurrentClass();
            var bonus = 0;
            
            for(var i = 0; i < bonuses.length; i++) {
                if(bonuses[i].char_class == curClass._id && bonuses[i].level == lvl) {
                    bonus = bonuses[i].bonus;
                    break;
                }
            }
            
            return bonus;
        }
        
    
    }])



;
