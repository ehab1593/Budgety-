//Module 1 *Budget Controller*
var budgetController = (function() {

    //contructors
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
           this.percentage = Math.round((this.value / totalIncome) * 100); 
        } else{
            this.percentage = -1;
        }
    }

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }

    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(curr){
            sum+= curr.value;
        })

        data.totals[type] = sum;
    }

    var data = {
        allItems: {
            exp: [],
            inc: []
        },

        totals:{
            exp: 0,
            inc: 0
        },

        budget: 0,
        percentage: -1
    };

    return {
        addItems: function(type, des, val){
            var newItem, ID;

            //[1 2 3 4 5], next ID = 6
            //[1 2 4 6 8], next ID = 9
            // ID = last ID + 1

            //Create new id

            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1; //getting the last item is array length -1
            } else {
                ID = 0;
            }
            //Create new item
            if(type === 'exp'){
                newItem = new Expense(ID, des, val);
            } else if(type === 'inc'){
                newItem = new Income(ID, des, val);
            }

            //Push into data structure
            data.allItems[type].push(newItem);

            //returning the element to other controllers to make them accessible
            return newItem;
        },


        deleteItem: function(type, id){
            var ids, index;
           ids=  data.allItems[type].map(function(current){
                return current.id;
            });

            index = ids.indexOf(id);

            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }
        },

        calcPercentage: function(){
        
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            })
        },

        getPercentages: function(){
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            })
            return allPerc;
        },

        calculateBudget: function(){
            
            //1. Calculate total income and expenses
                calculateTotal('exp');
                calculateTotal('inc');

            //2. Return the total budget: income - budget
                data.budget = data.totals.inc - data.totals.exp;

            //3. Calculate the percentage of income spent
                if(data.totals.inc > 0){
                    data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100); 
                }else{
                    data.percentage = -1;
                }

        },

       getBudget: function(){
            return{
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        //function to retrieve all ids 

        getAllIds: function(){
            var incIDs, expIDs, allIDs;

            expIDs = data.allItems.exp.map(function(cur){
                return `exp-${cur.id}`;
            });

            incIDs = data.allItems.inc.map(function(cur){
                return `inc-${cur.id}`;
            });

            allIDs = expIDs.concat(incIDs);

            return allIDs;

        },

        deleteAllItems: function(){

            data.allItems.inc = [];
            data.allItems.exp = [];

        },

        testing: function(){
            console.log(data);
        }

     

};
           
        
})();


//Module 2 *UI Controller*
var UIController = (function() {
  
//Object of  strings for input values to be used in queries

  var domStrings = {
      inputType: '.add__type',
      inputDescription: '.add__description',
      inputValue: '.add__value',
      inputButton: '.add__btn',
      incomeContainer: '.income__list',
      expenseContainer: '.expenses__list',
      budgetLabel: '.budget__value',
      incomeLabel: '.budget__income--value',
      expenseLabel: '.budget__expenses--value',
      percentageLabel: '.budget__expenses--percentage',
      container: '.container',
      ExpensesPercLabels: '.item__percentage',
      dateLabel: '.budget__title--month'
  };

  var formatNumber = function(num, type){
    var numSplit, int, dec;
    /*Rules
    + or - before number to display
    2 demical points
    comma separating the thousand and over digits
    */

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.');

    int = numSplit[0];
    if(int.length > 3){
        int = int.substr(0, int.length -3) + ',' + int.substr(int.length -3, 3)
    }



    dec = numSplit[1];

    return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec; 
       
};


 //custom forEach function for NodeList
 nodeListForEach = function(list, callback){
    for(i = 0; i < list.length; i++){
        callback(list[i], i);
    }
};

    return{
        getInput : function(){ 

            return {
                type: document.querySelector(domStrings.inputType).value,
                description: document.querySelector(domStrings.inputDescription).value,
                 value: parseFloat(document.querySelector(domStrings.inputValue).value)
            };
    },

    addListItem: function(obj, type){
        var html, newHtml, element;
        //1. Create html string with placeholder text

        if(type === 'inc'){
           element = domStrings.incomeContainer;

           html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix">\
            <div class="item__value">%value%</div><div class="item__delete">\
            <button class="item__delete--btn"><i class="ion-ios-close-outline"></i>\
            </button></div></div></div>';


        }else if(type === 'exp' ){
            element = domStrings.expenseContainer;
            
            html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div>\
            <div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div>\
            <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>\
            </div></div></div>';
        }
        //2. Replace placeholder text with actual data

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

        //3. Insert the HTML in to the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

    },

    deleteListItem: function(selectorID){
        var el;
        el = document.getElementById(selectorID);

        //Since we can only remove a child through remove child method, we need to use parentNode function to remove the elemtn
        el.parentNode.removeChild(el);
    },

    clearField: function(){
        var fields, fieldsArr;

        fields = document.querySelectorAll(domStrings.inputDescription + ', ' + domStrings.inputValue);

        fieldsArr = Array.prototype.slice.call(fields);

        fieldsArr.forEach(function(current, index, array) {
            current.value = "";

        });

        fieldsArr[0].focus();

    },

    displayBudget: function(obj){

         obj.budget > 0 ? type = 'inc' : type = 'exp';

        document.querySelector(domStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
        document.querySelector(domStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
        document.querySelector(domStrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');

        if(obj.percentage > 0){
            document.querySelector(domStrings.percentageLabel).textContent = obj.percentage + '%';

        }else{
            document.querySelector(domStrings.percentageLabel).textContent = '---';
        }

    },

    displayPercentages: function(allPercentages){
        //using querySelectorAll because we need to select the whole list of items not just 1 element
        var fields = document.querySelectorAll(domStrings.ExpensesPercLabels);
        
        //calling the callback from custom NodeList function
        nodeListForEach(fields, function(current, index){
            if(allPercentages[i] > 0){
                current.textContent = allPercentages[i] + '%'; 
            }else{
                current.textContent = '---'; 

            }
        });

    },

    displayDate: function(){
        var now, months, month, year;

        now = new Date();

        months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        year = now.getFullYear();

        month = now.getMonth();

        //Since getMonth() is zero based so it would take into account the index number and display month accordingly
        document.querySelector(domStrings.dateLabel).textContent = months[month] + ' ' + year;

    },

    changedType: function(){

        var fields = document.querySelectorAll(
        domStrings.inputType + ',' +
        domStrings.inputDescription + ',' +
        domStrings.inputValue);

        nodeListForEach(fields, function(cur){
            cur.classList.toggle('red-focus');
        });

        document.querySelector(domStrings.inputButton).classList.toggle('red');


    },

    getDomStrings: function(){
        return domStrings;
    }

    };
    
})(); 


//Module 3 *Global App Controller*
var appController = (function (budgetCtrl,UICtrl) {      

    var setupEventListeners = function(){
        var Dom = UICtrl.getDomStrings();

        
        document.querySelector(Dom.inputButton).addEventListener('click', ctrlAddItem);

        document.querySelector(".delete__all").addEventListener('click', ctrlDeleteAllItems);
        
    document.addEventListener('keypress', function(event){

        if (event.keyCode === 13 || event.which === 13) {
            ctrlAddItem();
        }
    });

    document.querySelector(Dom.container).addEventListener('click', ctrlDeleteItem);

    document.querySelector(Dom.inputType).addEventListener('change', UICtrl.changedType);

    };
    
    var updateBudget = function(){

        // 1. Calculate the budget
            budgetController.calculateBudget();

        // 2. Return the budget
            var budget = budgetController.getBudget();
        // 3. Display the budget on the UI (Passing in the obj which to return, in\
        //this case it is budget from above line since that is budget that is to display
        
        UICtrl.displayBudget(budget);
    }

    var updatePercentage = function(){
        
        //1. Calculate the percentages
        budgetCtrl.calcPercentage();
        //2. Read the percentages from the budget controller
        var allPercentages = budgetCtrl.getPercentages();
        //3. Update the UI
        UICtrl.displayPercentages(allPercentages);
    }

    var ctrlAddItem = function(){

        var input, newItem;
         // 1. Get the input field data
        input = UICtrl.getInput();

        //**Check if fields are not empty then only add item */
        if(input.description !== '' && !isNaN(input.value) && input.value > 0){
            
        // 2. Add the item to the budget controller
        
        newItem = budgetCtrl.addItems(input.type, input.description, input.value);
        // 3. Add the item to the UI

        UICtrl.addListItem(newItem, input.type);

        // 4. Clear the input fields
        UICtrl.clearField();

        // 5. Calling update budget funtion
        updateBudget();

        //6. Update the percentages
        updatePercentage();

        }

       
     
    };

    var ctrlDeleteItem = function(event){
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]); 
        
            //1. delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);
            //2. delete the item from the UI
            UICtrl.deleteListItem(itemID);
            //3. show and update the new totals
            updateBudget();
            //4. Update the percentages
            updatePercentage();

        }
    };


    ctrlDeleteAllItems = function(){
        var allIDs;

        //1. Fetch all IDs

        allIDs = budgetController.getAllIds();

        //2. Delete list items from the UI

        allIDs.forEach(function(cur){
        UIController.deleteListItem(cur);
        });

        //3. Delete all items in the data structure
        budgetController.deleteAllItems();

        //4. Update and show the new budget
        updateBudget();

        //5.Calculate and update percentage
        updatePercentage();

        };

    return {
        init: function(){
        console.log('App has started');
        UICtrl.displayDate();
        //reset all values of labels on reload/init
        UICtrl.displayBudget({
            budget: 0,
            totalInc: 0,
            totalExp: 0,
            percentage: 0
        })
        setupEventListeners();
    }
};

})(budgetController, UIController);

appController.init();