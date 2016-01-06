function loading(){
  $("#loading").show();
  $("#scan_barcode").hide();
  $("#content").hide();
}

function scan_barcode(){
  $("#loading").hide();
  $("#scan_barcode").show();
  $("#content").hide();
}

function content(){
  $("#loading").hide();
  $("#scan_barcode").hide();
  $("#content").show();
}


function randomString(length, chars) {
    var mask = '';
    if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
    if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (chars.indexOf('#') > -1) mask += '0123456789';
    if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
    var result = '';
    for (var i = length; i > 0; --i) result += mask[Math.round(Math.random() * (mask.length - 1))];
    return result;
}
loading();
//Set up the user so that they are unique, if they are not registered yet, register them.
//First check if there is a unique id stored in the browser storage, if not save one.
chrome.storage.sync.get('pop_unique_id',function(data) {
    // Notify that we saved.
    if(JSON.stringify(data['pop_unique_id']) == undefined)
    {
        var unique_id = randomString(16, 'Aa#');
        chrome.storage.sync.set({'pop_unique_id' : unique_id},function() {
            // Notify that we saved.
            // alert("Settings Saved!");
          });
    }
});

loading();

//If theres already a device linked. Show the pop section. 
chrome.storage.sync.get('device_linked', function(data){
    
    if(data['device_linked'] == true)
    { 
        content();
    }
    else
    {
      var unique_id = null;
      //Now register them in our firebase database.
      chrome.storage.sync.get('pop_unique_id',function(data) {
          var myFirebaseRef = new Firebase("https://popandroid.firebaseio.com/");
          //check if that unique id exists in firebase.
          myFirebaseRef.once('value', function(snapshot) {

            if (snapshot.hasChild(data['pop_unique_id'])) {
              $("#barcode").attr("src", "http://www.qr-code-generator.com/phpqrcode/getCode.php?cht=qr&chl="+data['pop_unique_id']+"&chs=150x150&choe=UTF-8&chld=L|0");
            }
            else
            {
                unique_id = data['pop_unique_id'];
                var user_info = {};
                user_info[unique_id] = {
                                device_linked: false,
                                current_pop: ""
                              };
                myFirebaseRef.set(user_info);
                $("#barcode").attr("src", "http://www.qr-code-generator.com/phpqrcode/getCode.php?cht=qr&chl="+data['pop_unique_id']+"&chs=150x150&choe=UTF-8&chld=L|0");
            }
            scan_barcode();
          });

          myFirebaseRef.child(data['pop_unique_id']).on("child_changed", function(snapshot) {
            var pop = snapshot.val();
            if(pop == true)
            {
              chrome.storage.sync.set({'device_linked' : true},function() {
                  // Notify that we saved.
                });
              content();
            }
          });
      }); 
    }
});
    
$("#pop_it").click(function(){
    var text = $("#content_to_pop").val();
    console.log(text);
    chrome.storage.sync.get('pop_unique_id',function(data) {
    // Notify that we saved.
    if(JSON.stringify(data['pop_unique_id']) != undefined)
    {
        var myFirebaseRef = new Firebase("https://popandroid.firebaseio.com/" + data['pop_unique_id']);
        myFirebaseRef.set({ current_pop: text});
    }
});
});

document.addEventListener('DOMContentLoaded', function() {
    var link = document.getElementById('pop_it');
    var content_to_pop = document.getElementById('content_to_pop');

      link.addEventListener('click', function() {
          if(content_to_pop.value == "")
          {
              alert("You must enter a value."); 
          }
          else
          {
              chrome.storage.sync.get('pop_unique_id',function(data) {
                  // Notify that we saved.
                  if(JSON.stringify(data['pop_unique_id']) != undefined)
                  {
                      var myFirebaseRef = new Firebase("https://popandroid.firebaseio.com/" + data['pop_unique_id']);
                      myFirebaseRef.set({ current_pop: content_to_pop.value});
                  }
              });
          }
      });
    
});