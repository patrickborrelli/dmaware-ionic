angular.module('dmaware.controllers', [])

.controller('AppCtrl', ['$scope', '$rootScope', '$ionicModal', '$state', 'authService', 'userService', function($scope, $rootScope, $ionicModal, $state, authService, userService) {

    // Form data for the login modal
    $scope.loginData = {};
    $scope.registrationData = {};
    
    $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.loginform = modal;
    });
    
    $ionicModal.fromTemplateUrl('templates/register.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.registerform = modal;
    });

    $scope.isAuthenticated = function() {
        return authService.isUserAuthenticated();
    };
    
    $scope.closeRegister = function() {
        $scope.registerform.hide();
    };

    $scope.getUserFullname = function() {
        return userService.getUserFullname();
    };        

    // Perform the login action when the user submits the login form
    $scope.doLogin = function() {
        console.log('Doing login', $scope.loginData);
        $scope.loginform.show();
    };

    $scope.closeLogin = function() {
        $scope.loginform.hide();
    };

    $scope.processLogin = function() {
        console.log('Processing login ', $scope.loginData);
        authService.login($scope.loginData);  
        $scope.closeLogin();
    };
    
    $scope.doRegister = function() {
        console.log('Doing registration', $scope.registrationData);
        $scope.registerform.show();
    };

    $scope.closeRegister = function() {
        $scope.registerform.hide();
    };

    $scope.processRegistration = function() {
        console.log('Doing registration', $scope.registrationData); 
        authService.register($scope.registrationData);
        $scope.closeRegister();
    };

    $scope.processLogout = function() {
        console.log('Logging out user ' + userService.getUserFullname());
        authService.logout();
        ngDialog.close();
    };  
    
    $scope.switchToRace = function(username, charactername) {
        $rootScope.characterForm = {
            player: username,
            character: charactername,
            level: 1
        };
        console.log("Switching to race selection for user " + username + " and character " + charactername);
        $state.go('app.race');
    };
}])

.controller('HomeController', ['$scope', '$rootScope', '$state', '$timeout', 'authService', 'userService', 'classService', 'raceService', 'characterService', 'coreDataService', function($scope, $rootScope, $state, $timeout, authService, userService, classService, raceService, characterService, coreDataService) {
        
    
        $scope.mainForm = {};
                
        $scope.playDice = function() {
            var audio = new Audio('audio/dice.mp3');
            audio.play();
        }
        
        $scope.races = raceService.getAllRaces();
        $scope.classes = classService.getAllClasses();
        $scope.alignments = coreDataService.getAlignments();
    
        console.log("Retrieved all races" );
        console.log($scope.races); 
    
        console.log($rootScope.characterForm);
        
        $scope.getUserName = function() {
            return userService.getUserFullname().toUpperCase();
        };

        $scope.switchTab = function(tabIndex){ 
            $timeout(function(){
                $scope.activeIndex = tabIndex;
            });
        };
        
        $scope.isAuthenticated = function() {
            return authService.isUserAuthenticated();
        };
        
        $scope.isAdmin = function() {
            return authService.isAdmin();
        };
        
        //Race ///////////////////////////////////
        
        
        $scope.saveCurrentRace = function() {       
            console.log("current character form contains:");
            console.log($rootScope.characterForm);
            $state.go('app.class');
        };       
        
        ////////////////////////////////////////////
        
        
        //Class ///////////////////////////////////
                
        $scope.saveCurrentClass = function() {
            classService.getCharClassByName($rootScope.characterForm.characterclass)
                .then(function(response) {
                    console.log("received class");
                    console.log(response);
                    classService.setCurrentClass(response.data[0]);
            });
            
            console.log("current character form contains:");
            console.log($rootScope.characterForm);
            $state.go('app.alignment');
        };  
        
        ////////////////////////////////////////////   
        
        //Alignment ///////////////////////////////////
       
        $scope.saveCurrentAlignment = function() {         
            console.log("current character form contains:");
            console.log($rootScope.characterForm);
        };  
                
        ////////////////////////////////////////////   
        
        //Abilities ///////////////////////////////////
        
        $scope.strDisabled = false;
        $scope.dexDisabled = false;
        $scope.conDisabled = false;
        $scope.wisDisabled = false;
        $scope.intDisabled = false;
        $scope.chaDisabled = false;
        
        $scope.openAbilities = function() {
            $scope.abilityDisabled = false; 
            $scope.switchTab(4);
            if($scope.strDisabled) {
                //leave this form
            } else {
                $scope.abilityForm = {
                    strRoll1: 0,
                    strRoll2: 0,
                    strRoll3: 0,
                    strRoll4: 0,
                    strTotal: 0,
                    dexRoll1: 0,
                    dexRoll2: 0,
                    dexRoll3: 0,
                    dexRoll4: 0,
                    dexTotal: 0,
                    conRoll1: 0,
                    conRoll2: 0,
                    conRoll3: 0,
                    conRoll4: 0,
                    conTotal: 0,
                    wisRoll1: 0,
                    wisRoll2: 0,
                    wisRoll3: 0,
                    wisRoll4: 0,
                    wisTotal: 0,
                    intRoll1: 0,
                    intRoll2: 0,
                    intRoll3: 0,
                    intRoll4: 0,
                    intTotal: 0,
                    chaRoll1: 0,
                    chaRoll2: 0,
                    chaRoll3: 0,
                    chaRoll4: 0,
                    chaTotal: 0
                };
            }
            
        }
        
        $scope.rollStr = function() {
            $scope.playDice();
            var str1 = $scope.abilityForm.strRoll1 = Math.floor((Math.random() * 6) + 1);
            var str2 = $scope.abilityForm.strRoll2 = Math.floor((Math.random() * 6) + 1);
            var str3 = $scope.abilityForm.strRoll3 = Math.floor((Math.random() * 6) + 1);
            var str4 = $scope.abilityForm.strRoll4 = Math.floor((Math.random() * 6) + 1);
            var total = str1 + str2 + str3 + str4;
            $scope.abilityForm.strTotal = total - $scope.findLowest([str1, str2, str3, str4]); 
            $scope.strDisabled = true;
        };
        
        $scope.rollDex = function() {
            $scope.playDice();
            var dex1 = $scope.abilityForm.dexRoll1 = Math.floor((Math.random() * 6) + 1);
            var dex2 = $scope.abilityForm.dexRoll2 = Math.floor((Math.random() * 6) + 1);
            var dex3 = $scope.abilityForm.dexRoll3 = Math.floor((Math.random() * 6) + 1);
            var dex4 = $scope.abilityForm.dexRoll4 = Math.floor((Math.random() * 6) + 1);
            var total = dex1 + dex2 + dex3 + dex4;
            $scope.abilityForm.dexTotal = total - $scope.findLowest([dex1, dex2, dex3, dex4]);
            $scope.dexDisabled = true;
        };
        
        $scope.rollCon = function() {
            $scope.playDice();
            var con1 = $scope.abilityForm.conRoll1 = Math.floor((Math.random() * 6) + 1);
            var con2 = $scope.abilityForm.conRoll2 = Math.floor((Math.random() * 6) + 1);
            var con3 = $scope.abilityForm.conRoll3 = Math.floor((Math.random() * 6) + 1);
            var con4 = $scope.abilityForm.conRoll4 = Math.floor((Math.random() * 6) + 1);
            var total = con1 + con2 + con3 + con4;
            $scope.abilityForm.conTotal = total - $scope.findLowest([con1, con2, con3, con4]);  
            $scope.conDisabled = true;
        };
        
        $scope.rollWis = function() {
            $scope.playDice();
            var wis1 = $scope.abilityForm.wisRoll1 = Math.floor((Math.random() * 6) + 1);
            var wis2 = $scope.abilityForm.wisRoll2 = Math.floor((Math.random() * 6) + 1);
            var wis3 = $scope.abilityForm.wisRoll3 = Math.floor((Math.random() * 6) + 1);
            var wis4 = $scope.abilityForm.wisRoll4 = Math.floor((Math.random() * 6) + 1);
            var total = wis1 + wis2 + wis3 + wis4;
            $scope.abilityForm.wisTotal = total - $scope.findLowest([wis1, wis2, wis3, wis4]); 
            $scope.wisDisabled = true;
        };
        
        $scope.rollInt = function() {
            $scope.playDice();
            var int1 = $scope.abilityForm.intRoll1 = Math.floor((Math.random() * 6) + 1);
            var int2 = $scope.abilityForm.intRoll2 = Math.floor((Math.random() * 6) + 1);
            var int3 = $scope.abilityForm.intRoll3 = Math.floor((Math.random() * 6) + 1);
            var int4 = $scope.abilityForm.intRoll4 = Math.floor((Math.random() * 6) + 1);
            var total = int1 + int2 + int3 + int4;
            $scope.abilityForm.intTotal = total - $scope.findLowest([int1, int2, int3, int4]); 
            $scope.intDisabled = true;
        };
        
        $scope.rollCha = function() {
            $scope.playDice();
            var cha1 = $scope.abilityForm.chaRoll1 = Math.floor((Math.random() * 6) + 1);
            var cha2 = $scope.abilityForm.chaRoll2 = Math.floor((Math.random() * 6) + 1);
            var cha3 = $scope.abilityForm.chaRoll3 = Math.floor((Math.random() * 6) + 1);
            var cha4 = $scope.abilityForm.chaRoll4 = Math.floor((Math.random() * 6) + 1);
            var total = cha1 + cha2 + cha3 + cha4;
            $scope.abilityForm.chaTotal = total - $scope.findLowest([cha1, cha2, cha3, cha4]);  
            $scope.chaDisabled = true;
        };
        
        $scope.findLowest = function(values) {
            var lowest = 7;
            for(var i = 0; i < values.length; i++) {
                if(values[i] < lowest) lowest = values[i];
            }
            return lowest;
        };                
        
        $scope.saveCurrentAbilities = function() {
            $scope.characterForm.str = $scope.abilityForm.strTotal;
            $scope.characterForm.dex = $scope.abilityForm.dexTotal;
            $scope.characterForm.con = $scope.abilityForm.conTotal;
            $scope.characterForm.wis = $scope.abilityForm.wisTotal;
            $scope.characterForm.int = $scope.abilityForm.intTotal;
            $scope.characterForm.cha = $scope.abilityForm.chaTotal;            

            console.log("current character form contains:");
            console.log($scope.characterForm);
            $scope.openSkills();
        };  
        
        ////////////////////////////////////////////   
        
        //Skills ///////////////////////////////////
        $scope.acroDisabled = false;
        $scope.animDisabled = false;
        $scope.arcaDisabled = false;
        $scope.athlDisabled = false;
        $scope.deceDisabled = false;
        $scope.histDisabled = false;
        $scope.insiDisabled = false;
        $scope.intiDisabled = false;
        $scope.inveDisabled = false;
        $scope.mediDisabled = false;
        $scope.natuDisabled = false;
        $scope.percDisabled = false;
        $scope.perfDisabled = false;
        $scope.persDisabled = false;
        $scope.reliDisabled = false;
        $scope.sleiDisabled = false;
        $scope.steaDisabled = false;
        $scope.survDisabled = false;
                
        $scope.languageCount = 0;
        $scope.skillCount = 0;
        $scope.selectedLanguages = [];
        $scope.selectedSkills = [];
                
        $scope.raceString = '';
        $scope.classString = '';
        
        $scope.setAllEnabled = function() {
            $scope.acroDisabled = false;
            $scope.animDisabled = false;
            $scope.arcaDisabled = false;
            $scope.athlDisabled = false;
            $scope.deceDisabled = false;
            $scope.histDisabled = false;
            $scope.insiDisabled = false;
            $scope.intiDisabled = false;
            $scope.inveDisabled = false;
            $scope.mediDisabled = false;
            $scope.natuDisabled = false;
            $scope.percDisabled = false;
            $scope.perfDisabled = false;
            $scope.persDisabled = false;
            $scope.reliDisabled = false;
            $scope.sleiDisabled = false;
            $scope.steaDisabled = false;
            $scope.survDisabled = false;
        };
        
        $scope.setAllDisabled = function() {
            $scope.acroDisabled = true;
            $scope.animDisabled = true;
            $scope.arcaDisabled = true;
            $scope.athlDisabled = true;
            $scope.deceDisabled = true;
            $scope.histDisabled = true;
            $scope.insiDisabled = true;
            $scope.intiDisabled = true;
            $scope.inveDisabled = true;
            $scope.mediDisabled = true;
            $scope.natuDisabled = true;
            $scope.percDisabled = true;
            $scope.perfDisabled = true;
            $scope.persDisabled = true;
            $scope.reliDisabled = true;
            $scope.sleiDisabled = true;
            $scope.steaDisabled = true;
            $scope.survDisabled = true;
        };
        
        
        $scope.skillForm = { 
            acrobatics: false, 
            animal_handling: false, 
            arcana: false, 
            athletics: false, 
            deception: false, 
            history: false, 
            insight: false, 
            intimidation: false, 
            investigation: false, 
            medicine: false, 
            nature: false, 
            perception: false, 
            persuasion: false, 
            religion: false, 
            sleight_of_hand: false, 
            stealth: false, 
            survival: false, 
            common: false,
            dwarvish: false,
            elvish: false,
            giant: false,
            gnomish: false,
            goblin: false,
            halfling: false,
            orcish: false                 
        }; 
        
        $scope.openSkills = function() {            
            $scope.determineSkillState($scope.characterForm.race, $scope.characterForm.characterclass);
            $scope.skillsDisabled = false; 
            $scope.switchTab(5); 
        };
        
        $scope.languagesDisabled = function() {
            $('.myLanguages').change(function(){
                if($('input.myLanguages').filter(':checked').length == $scope.languageCount)
                    $('input.myLanguages:not(:checked)').attr('disabled', 'disabled');
                else
                    $('input.myLanguages').removeAttr('disabled');
            });
        };
        
        $scope.disabledSkills = function() {
            $('.mySkills').change(function(){
                if($('input.mySkills').filter(':checked').length == $scope.skillCount)
                    $('input.mySkills:not(:checked)').attr('disabled', 'disabled');
                else
                    $('input.mySkills').removeAttr('disabled');
            });
        };
        
        $scope.determineSkillState = function(race, charClass) {
            //first set all the available skills based on class:
            switch(charClass) {
                case 'Barbarian':
                    $scope.classString = "Barbarians choose two skills from Animal Handling, Athletics, Intimidation, Nature, Perception, and Survival.";
                    $scope.setAllDisabled();
                    $scope.animDisabled = false;
                    $scope.athlDisabled = false;
                    $scope.intiDisabled = false;
                    $scope.natuDisabled = false;
                    $scope.percDisabled = false;
                    $scope.survDisabled = false;
                    $scope.skillCount = 2;
                    break;
                case 'Bard': 
                    $scope.classString = "Bards choose any three skills";
                    $scope.setAllEnabled();
                    $scope.skillCount = 3;
                    break;
                case 'Cleric':
                    $scope.classString = "Clerics choose two skills from History, Insight, Medicine, Persuasion, and Religion.";
                    $scope.setAllDisabled();
                    $scope.histDisabled = false;
                    $scope.insiDisabled = false;
                    $scope.mediDisabled = false;
                    $scope.persDisabled = false;
                    $scope.reliDisabled = false;
                    $scope.skillCount = 2;
                    break;
                case 'Druid':
                    $scope.classString = "Druids choose two skills from Arcana, Animal Handling, Insight, Medicine, Nature, Perception, Religion, and Survival.";
                    $scope.setAllDisabled();
                    $scope.arcaDisabled = false;
                    $scope.animDisabled = false;
                    $scope.insiDisabled = false;
                    $scope.mediDisabled = false;
                    $scope.natuDisabled = false;
                    $scope.percDisabled = false;
                    $scope.reliDisabled = false;
                    $scope.survDisabled = false;
                    $scope.skillCount = 2;
                    break;
                case 'Fighter':
                    $scope.classString = "Fighters choose two skills from Acrobatics, Animal Handling, Athletics, History, Insight, Intimidation, Perception, and Survival.";
                    $scope.setAllDisabled();
                    $scope.acroDisabled = false;
                    $scope.animDisabled = false;
                    $scope.athlDisabled = false;
                    $scope.histDisabled = false;
                    $scope.insiDisabled = false;
                    $scope.intiDisabled = false;
                    $scope.percDisabled = false;
                    $scope.survDisabled = false;
                    $scope.skillCount = 2;
                    break;
                case 'Monk':
                    $scope.classString = "Monks choose two skills from Acrobatics, Athletics, History, Insight, Religion, and Stealth.";
                    $scope.setAllDisabled();
                    $scope.acroDisabled = false;
                    $scope.athlDisabled = false;
                    $scope.histDisabled = false;
                    $scope.insiDisabled = false;
                    $scope.reliDisabled = false;
                    $scope.steaDisabled = false;
                    $scope.skillCount = 2;
                    break;
                case 'Paladin':
                    $scope.classString = "Paladins choose two skills from Athletics, Insight, Intimidation, Medicine, Persuasion, and Religion.";
                    $scope.setAllDisabled();
                    $scope.athlDisabled = false;
                    $scope.insiDisabled = false;
                    $scope.intiDisabled = false;
                    $scope.mediDisabled = false;
                    $scope.persDisabled = false;
                    $scope.reliDisabled = false;
                    $scope.skillCount = 2;
                    break;
                case 'Ranger':
                    $scope.classString = "Rangers choose three skills from Animal Handling, Athletics, Insight, Investigation, Nature, Preception, and Stealth.";
                    $scope.setAllDisabled();
                    $scope.animDisabled = false;
                    $scope.athlDisabled = false;
                    $scope.insiDisabled = false;
                    $scope.inveDisabled = false;
                    $scope.natuDisabled = false;
                    $scope.percDisabled = false;
                    $scope.steaDisabled = false;
                    $scope.skillCount = 3;
                    break;
                case 'Rogue':
                    $scope.classString = "Rogues choose four skills from Acrobatics, Athletics, Deception, Insight, Intimidation, Investigation, Perception, Performance, Persuasion, Sleight of Hand, and Stealth.";
                    $scope.setAllDisabled();
                    $scope.acroDisabled = false;
                    $scope.athlDisabled = false; 
                    $scope.deceDisabled = false; 
                    $scope.insiDisabled = false;
                    $scope.intiDisabled = false;
                    $scope.inveDisabled = false;
                    $scope.percDisabled = false; 
                    $scope.perfDisabled = false;
                    $scope.persDisabled = false;
                    $scope.sleiDisabled = false;
                    $scope.steaDisabled = false;
                    $scope.skillCount = 4;
                    break;
                case 'Sorcerer':
                    $scope.classString = "Sorcerers choose two skills from Arcana, Deception, Insight, Intimidation, Persuasion, and Religion.";
                    $scope.setAllDisabled();
                    $scope.arcaDisabled = false;
                    $scope.deceDisabled = false;
                    $scope.insiDisabled = false;
                    $scope.intiDisabled = false;
                    $scope.persDisabled = false;
                    $scope.reliDisabled - false;
                    $scope.skillCount = 2;
                    break;                
                case 'Warlock':
                    $scope.classString = "Warlocks choose two skills from Arcana, Deception, History, Intimidation, Investigation, Nature, and Religion.";
                    $scope.setAllDisabled();
                    $scope.arcaDisabled = false;
                    $scope.deceDisabled = false;
                    $scope.histDisabled = false;
                    $scope.intiDisabled = false;
                    $scope.inveDisabled = false;
                    $scope.natuDisabled = false;
                    $scope.reliDisabled - false;
                    $scope.skillCount = 2;
                    break;                
                case 'Wizard':
                    $scope.classString = "Wizards choose two skills from Arcana, History, Insight, Investigation, Medicine, and Religion.";
                    $scope.setAllDisabled();
                    $scope.arcaDisabled = false;
                    $scope.histDisabled = false;
                    $scope.insiDisabled = false;
                    $scope.inveDisabled = false; 
                    $scope.mediDisabled = false;
                    $scope.reliDisabled = false;
                    $scope.skillCount = 2;
                    break;
            }
            
            //next set all the available languages based on race:
            switch(race) {
                case 'Dwarf':
                case 'Hill Dwarf':
                    $scope.raceString = "You can speak, read, and write Common and Dwarvish. Dwarvish is full of hard consonants and guttural sounds, and those characteristics spill over into whatever other language a dwarf might speak.";
                    $scope.setLanguageChecked('common');
                    $scope.setLanguageChecked('dwarvish');
                    $scope.selectedLanguages.push("Common");                    
                    $scope.selectedLanguages.push("Dwarvish");
                    $scope.setAllLangDisabled();
                    $scope.languageCount = 2;
                    break;
                case 'Elf': 
                    $scope.raceString = "You can speak, read, and write Common and Elvish. Elvish is fluid, with subtle intonations and intricate grammar. Elven literature is rich and varied, and their songs and poems are famous among other races. Many bards learn their language so they can add Elvish ballads to their repertoires.";
                    $scope.setLanguageChecked('common');
                    $scope.setLanguageChecked('elvish');
                    $scope.selectedLanguages.push("Common");
                    $scope.selectedLanguages.push("Elvish");
                    $scope.setAllLangDisabled();
                    $scope.languageCount = 2;
                    break;
                case 'High Elf':
                    $scope.raceString = "You can speak, read, and write Common and Elvish. Elvish is fluid, with subtle intonations and intricate grammar. Elven literature is rich and varied, and their songs and poems are famous among other races. Many bards learn their language so they can add Elvish ballads to their repertoires. As a High Elf, you can speak one extra language of your choice."; 
                    $scope.setLanguageChecked('common');
                    $scope.setLanguageChecked('elvish');
                    $scope.setLanguageDisabled('common');
                    $scope.setLanguageDisabled('elvish');
                    $scope.selectedLanguages.push("Common");
                    $scope.selectedLanguages.push("Elvish");
                    $scope.languageCount = 3;
                    break;
                case 'Halfling':
                case 'Lightfoot':
                    $scope.raceString = "You can speak, read, and write Common and Halfling. The Halfling language isn’t secret, but halflings are loath to share it with others. They write very little, so they don’t have a rich body of literature. Their oral tradition, however, is very strong. Almost all halflings speak Common to converse with the people in whose lands they dwell or through which they are traveling.";
                    $scope.setLanguageChecked('common');
                    $scope.setLanguageChecked('halfling');
                    $scope.selectedLanguages.push("Common");
                    $scope.selectedLanguages.push("Halfling");
                    $scope.setAllLangDisabled();
                    $scope.languageCount = 2;
                    break;
                case 'Human':
                    $scope.raceString = "You can speak, read, and write Common and one extra language of your choice. Humans typically learn the languages of other peoples they deal with, including obscure dialects. They are fond of sprinkling their speech with words borrowed from other tongues: Orc curses, Elvish musical expressions, Dwarvish military phrases, and so on.";
                    $scope.setLanguageChecked('common');
                    $scope.setLanguageDisabled('common');
                    $scope.selectedLanguages.push("Common");
                    $scope.languageCount = 2;
                    break;
                case 'Gnome':
                case 'Rock Gnome':
                    $scope.raceString = "You can speak, read, and write Common and Gnomish. The Gnomish language, which uses the Dwarvish script, is renowned for its technical treatises and its catalogs of knowledge about the natural world.";
                    $scope.setLanguageChecked('common');
                    $scope.setLanguageChecked('gnomish');
                    $scope.selectedLanguages.push("Common");
                    $scope.selectedLanguages.push("Gnomish");
                    $scope.setAllLangDisabled();
                    $scope.languageCount = 2;
                    break;
                case 'Half Elf':
                    $scope.raceString = "You can speak, read, and write Common, Elvish, and one extra language of your choice.";
                    $scope.setLanguageChecked('common');
                    $scope.setLanguageChecked('elvish');
                    $scope.setLanguageDisabled('common');
                    $scope.setLanguageDisabled('elvish');
                    $scope.selectedLanguages.push("Common");
                    $scope.selectedLanguages.push("Elvish");
                    $scope.languageCount = 3;
                    break;
                case 'Half Orc':
                    $scope.classString = "You can speak, read, and write Common and Orc. Orc is a harsh, grating language with hard consonants. It has no script of its own but is written in the Dwarvish script.";
                    $scope.setLanguageChecked('common');
                    $scope.setLanguageChecked('orcish');
                    $scope.selectedLanguages.push("Common");
                    $scope.selectedLanguages.push("Orcish");
                    $scope.setAllLangDisabled();
                    $scope.languageCount = 2;
                    break;
            }
        };
        
        $scope.setLanguageChecked = function(lang) {
            $("[name =" + lang + "]").prop('checked', true);
        };       
        
        $scope.setLanguageDisabled = function(lang) {
            $("[name =" + lang + "]").attr('disabled', true);
        };
        
        $scope.setAllLangDisabled = function() {
            $('input.myLanguages').attr('disabled', true);
        };
        
        $scope.setAllLangEnabled = function() {
            $('input.myLanguages').attr('disabled', false);
        };
        
        $scope.resetAllLanguages = function() {
            $('input.myLanguages').attr('disabled', false);            
            $('input.myLanguages').prop('checked', false);
        }; 
        
        $scope.getSkillCount = function() {
            var count = 0;
            if($scope.skillForm.acrobatics == true) count++;
            if($scope.skillForm.animal_handling == true) count++;
            if($scope.skillForm.arcana == true) count++;
            if($scope.skillForm.athletics == true) count++;
            if($scope.skillForm.deception == true) count++;
            if($scope.skillForm.history == true) count++;
            if($scope.skillForm.insight == true) count++;
            if($scope.skillForm.intimidation == true) count++;
            if($scope.skillForm.investigation== true) count++;
            if($scope.skillForm.medicine == true) count++;
            if($scope.skillForm.nature == true) count++;
            if($scope.skillForm.perception == true) count++;
            if($scope.skillForm.persuasion == true) count++;
            if($scope.skillForm.religion == true) count++;
            if($scope.skillForm.sleight_of_hand == true) count++;
            if($scope.skillForm.stealth == true) count++;
            if($scope.skillForm.survival == true) count++;
            return count;
        };
        
        $scope.openInfo = function(skill) {
            console.log('Attempting to open dialog for ' + skill);
            if(skill == 'ACRO') 
                ngDialog.open({ template: 'views/templates/acrobatics.html', scope: $scope, className: 'ngdialog-theme-default custom-width-600', controller:"HomeController" }); 
            else if(skill == 'ANIM')
                ngDialog.open({ template: 'views/templates/animalhandling.html', scope: $scope, className: 'ngdialog-theme-default custom-width-600', controller:"HomeController" }); 
            else if(skill == 'ARCA')
                ngDialog.open({ template: 'views/templates/arcana.html', scope: $scope, className: 'ngdialog-theme-default custom-width-600', controller:"HomeController" }); 
            else if(skill == 'ATHL')
                ngDialog.open({ template: 'views/templates/athletics.html', scope: $scope, className: 'ngdialog-theme-default custom-width-600', controller:"HomeController" }); 
            else if(skill == 'DECE')
                ngDialog.open({ template: 'views/templates/deception.html', scope: $scope, className: 'ngdialog-theme-default custom-width-600', controller:"HomeController" }); 
            else if(skill == 'HIST')
                ngDialog.open({ template: 'views/templates/history.html', scope: $scope, className: 'ngdialog-theme-default custom-width-600', controller:"HomeController" }); 
            else if(skill == 'INSI')
                ngDialog.open({ template: 'views/templates/insight.html', scope: $scope, className: 'ngdialog-theme-default custom-width-600', controller:"HomeController" }); 
            else if(skill == 'INTI')
                ngDialog.open({ template: 'views/templates/intimidation.html', scope: $scope, className: 'ngdialog-theme-default custom-width-600', controller:"HomeController" }); 
            else if(skill == 'INVE')
                ngDialog.open({ template: 'views/templates/investigation.html', scope: $scope, className: 'ngdialog-theme-default custom-width-600', controller:"HomeController" }); 
            else if(skill == 'MEDI')
                ngDialog.open({ template: 'views/templates/medicine.html', scope: $scope, className: 'ngdialog-theme-default custom-width-600', controller:"HomeController" }); 
            else if(skill == 'NATU')
                ngDialog.open({ template: 'views/templates/nature.html', scope: $scope, className: 'ngdialog-theme-default custom-width-600', controller:"HomeController" }); 
            else if(skill == 'PERC')
                ngDialog.open({ template: 'views/templates/perception.html', scope: $scope, className: 'ngdialog-theme-default custom-width-600', controller:"HomeController" }); 
            else if(skill == 'PERF')
                ngDialog.open({ template: 'views/templates/performance.html', scope: $scope, className: 'ngdialog-theme-default custom-width-600', controller:"HomeController" }); 
            else if(skill == 'PERS')
                ngDialog.open({ template: 'views/templates/persuasion.html', scope: $scope, className: 'ngdialog-theme-default custom-width-600', controller:"HomeController" }); 
            else if(skill == 'RELI')
                ngDialog.open({ template: 'views/templates/religion.html', scope: $scope, className: 'ngdialog-theme-default custom-width-600', controller:"HomeController" }); 
            else if(skill == 'SLEI')
                ngDialog.open({ template: 'views/templates/sleightofhand.html', scope: $scope, className: 'ngdialog-theme-default custom-width-600', controller:"HomeController" }); 
            else if(skill == 'STEA')
                ngDialog.open({ template: 'views/templates/stealth.html', scope: $scope, className: 'ngdialog-theme-default custom-width-600', controller:"HomeController" }); 
            else if(skill == 'SURV')
                ngDialog.open({ template: 'views/templates/survival.html', scope: $scope, className: 'ngdialog-theme-default custom-width-600', controller:"HomeController" }); 
        };
        
        $scope.saveCurrentSkills = function() {
            $scope.characterForm.skills = $scope.selectedSkills;
            $scope.characterForm.languages = $scope.selectedLanguages;
            console.log("current character form contains:");
            console.log($scope.characterForm);
            $scope.openEquipment();
        };
        
        ////////////////////////////////////////////   
        
        //Equipment/////////////////////////////////
        
        
        $scope.openEquipment = function() { 
            $scope.equipForm = {
                selectedPrimary: null,
                selectedSecondary: null,
                selectedTertiary: null,
                selectedArmor: null           
            };
            $scope.equipDisabled = false; 
            $scope.switchTab(6);             
            
            console.log(classService.getCurrentClass());
            $scope.primaryWeapons = classService.getCurrentClass().primary_weapon;
            $scope.secondaryWeapons = classService.getCurrentClass().secondary_weapon;
            $scope.tertiaryWeapons = classService.getCurrentClass().tertiary_weapon;
            $scope.armor = classService.getCurrentClass().armor;
            $scope.mandatoryItems = classService.getCurrentClass().mandatory_equipment;
                        
            $scope.hasPrimary = function() {
                if($scope.primaryWeapons.length > 0) {
                    return true;
                } else {
                    $scope.equipForm.selectedPrimary = null;
                    return false;
                }
            }
            
            $scope.hasSecondary = function() {
                if($scope.secondaryWeapons.length > 0) {
                    return true;
                } else {
                    $scope.equipForm.selectedSecondary = null;
                    return false;
                }
            }
            
            $scope.hasTertiary = function() {
                if($scope.tertiaryWeapons.length > 0) {
                    return true;
                } else {                    
                    $scope.equipForm.selectedTertiary = null;
                    return false;
                }
            }
            
            $scope.hasArmor = function() {
                if($scope.armor.length > 0) {
                    return true;
                } else {
                    $scope.equipForm.selectedArmor = null;
                    return false;
                }
            }
            
            $scope.hasMandatory = function() {
                if($scope.mandatoryItems.length > 0) {
                    return true;
                } else {
                    return false;
                }
            }
        };
        
        $scope.saveCurrentEquipment = function() {
            var equip = [];
            
            if($scope.equipForm.selectedPrimary != null) {
                equip.push($scope.equipForm.selectedPrimary);
            }
            
            if($scope.equipForm.selectedSecondary != null) {
                equip.push($scope.equipForm.selectedSecondary);
            }
            
            if($scope.equipForm.selectedTertiary != null) {
                equip.push($scope.equipForm.selectedTertiary);
            }
            
            if($scope.equipForm.selectedArmor != null) {
                equip.push($scope.equipForm.selectedArmor);
            }
            
            if($scope.hasMandatory) {
                for(var i = 0; i < $scope.mandatoryItems.length; i++) {
                    equip.push($scope.mandatoryItems[i]);
                }
            }
            
            $scope.characterForm.equipment = equip;            
            console.log("current character form contains:");
            console.log($scope.characterForm);
            $scope.openSpells();
        };
        
        ////////////////////////////////////////////   
        
        //Spells/////////////////////////////////
        $scope.openSpells = function() { 
            
            $scope.spellsDisabled = false; 
            $scope.switchTab(7);
            $scope.selectedCantrips = [];
            $scope.selectedSpells = [];
            $scope.cantripText = '';
            $scope.spellText = '';
            $scope.cantripCount = 2;
            $scope.spellCount = 0;            
            
            //get cantrips based on level and class:
            userService.getUserCantrips($scope.characterForm.characterclass)
            .then(function(response) {
                    console.log("received cantrips");
                    console.log(response.data);
                    $scope.cantrips = response.data;
            });
            
            //get spells based on level and class:
            userService.getUserSpells($scope.characterForm.characterclass, $scope.characterForm.level)
            .then(function(response) {
                    console.log("received spells");
                    console.log(response.data);
                    if($scope.characterForm.characterclass != 'Ranger' &&
                       $scope.characterForm.characterclass != 'Paladin')
                            $scope.spells = response.data;
            });
            
            switch($scope.characterForm.characterclass) {
                case 'Barbarian':
                    $scope.cantripText = "Barbarians are not magic users and do not get cantrips or spells."
                    break;
                case 'Bard':
                    $scope.cantripText = "Bards at 1st level know 2 cantrips. Select 2 cantrips from the list to the right."
                    $scope.cantripCount = 2;
                    $scope.spellText = "Bards at 1st level know 4 spells. Select 4 spells from the list to the right";
                    $scope.spellCount = 4;
                    break;
                case 'Cleric':
                    $scope.cantripText = "Clerics at 1st level know 3 cantrips. Select 3 cantrips from the list to the right."
                    $scope.cantripCount = 3;
                    $scope.spellText = "Clerics know all of their spells, none to select.";
                    $scope.spellCount = 0;
                    break;
                case 'Druid':
                    $scope.cantripText = "Druids at 1st level know 2 cantrips. Select 2 cantrips from the list to the right."
                    $scope.cantripCount = 2;
                    $scope.spellText = "Druids know all of their spells, none to select.";
                    $scope.spellCount = 0;
                    break;
                case 'Fighter':
                    $scope.cantripText = "Fighters are not magic users and do not get cantrips or spells."
                    break;
                case 'Monk':
                    $scope.cantripText = "Monks are not magic users and do not get cantrips or spells."
                    break;
                case 'Paladin':
                    $scope.cantripText = "Paladins do not get magical abilities at first level."
                    break;
                case 'Ranger':
                    $scope.cantripText = "Rangers do not get magical abilities at first level."
                    break;
                case 'Rogue':
                    $scope.cantripText = "Rogues are not magic users and do not get cantrips or spells."
                    break;
                case 'Sorcerer':
                    $scope.cantripText = "Sorcerers at 1st level know 4 cantrips. Select 4 cantrips from the list to the right."
                    $scope.cantripCount = 4;
                    $scope.spellText = "Sorcerers at 1st level know 2 spells. Select 2 spells from the list to the right.";
                    $scope.spellCount = 2;
                    break;
                case 'Warlock':
                    $scope.cantripText = "Warlocks at 1st level know 2 cantrips. Select 2 cantrips from the list to the right."
                    $scope.cantripCount = 2;
                    $scope.spellText = "Warlocks at 1st level know 2 spells. Select 2 spells from the list to the right.";
                    $scope.spellCount = 2;
                    break;
                case 'Wizard':
                    $scope.cantripText = "Wizards at 1st level know 3 cantrips. Select 3 cantrips from the list to the right."
                    $scope.cantripCount = 3;
                    $scope.spellText = "Wizards know all of their spells, none to select.";
                    $scope.spellCount = 0;
                    break;
            }
            
            $scope.disableCantrips = function() {
                $('.myCantrips').change(function(){
                    if($('input.myCantrips').filter(':checked').length == $scope.cantripCount)
                        $('input.myCantrips:not(:checked)').attr('disabled', 'disabled');
                    else
                        $('input.myCantrips').removeAttr('disabled');
                });
            };
                        
            $scope.disableSpells = function() {
                if($scope.spellCount == 0) {
                    $('input.mySpells').prop('checked', true);
                    $('input.mySpells').attr('disabled', true);
                }
                $('.mySpells').change(function(){
                    if($('input.mySpells').filter(':checked').length == $scope.spellCount) {
                        $('input.mySpells:not(:checked)').attr('disabled', 'disabled');
                    } else
                        $('input.mySpells').removeAttr('disabled');
                });
            };
            
        };
        
        $scope.hasCantrips = function() {
            return ($scope.cantrips != null && $scope.cantrips.length > 0);  
        };
        
        $scope.hasSpells = function() {
            return ($scope.spells != null && $scope.spells.length > 0);  
        };
        
        $scope.getAllSpells = function() {
            var spells = $scope.spells;
            var mySpells = [];
            for(var i = 0; i < spells.length; i++) {
                mySpells.push(spells[i]);
            }
            return mySpells;
        };
        
        $scope.saveCurrentSpells = function() {
            $scope.characterForm.cantrips = $scope.selectedCantrips; 
            $scope.characterForm.spells = $scope.selectedSpells; 
            if($scope.characterForm.characterclass == 'Cleric' ||
               $scope.characterForm.characterclass == 'Druid' ||
               $scope.characterForm.characterclass == 'Wizard') {
                //characters of these classes know all first level spells so add them to the form:
                $scope.characterForm.spells = $scope.getAllSpells();
            }
            console.log("current character form contains:");
            console.log($scope.characterForm);
            $scope.openSummary();
        };
        
        ////////////////////////////////////////////   
        
        //Summary/////////////////////////////////
        $scope.openSummary = function() { 
            $scope.summaryDisabled = false; 
            $scope.switchTab(8);
            
            $scope.hasCharacters = function() {
                $scope.characters = coreDataService.getUsersCharacters();
                if($scope.characters != null) 
                    return true;
                else
                    return false;                
            };
            
            $scope.deleteCharacter = function(charId) {
                characterService.deleteCharacter(charId);
                
            }
            
            //create character and save in scope
            $scope.character = characterService.generateCharacter($scope.characterForm);
        };
       
     }])
;