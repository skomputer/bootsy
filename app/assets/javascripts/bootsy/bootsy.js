window.Bootsy = (function(){

  var Bootsy = {caretBookmark: false, unsavedChanges: false, editor: false, editorOptions: {}, eventCallbacks: {'loaded': []}, triggeredEvents: []};

  Bootsy.translations = {
    en: {
      alert_unsaved: 'You have unsaved changes.'
    }
  };

  Bootsy.on = function(eventName, callback){
    Bootsy.eventCallbacks[eventName].push(callback);
  };

  Bootsy.trigger = function(eventName){
    var callbacks = Bootsy.eventCallbacks[eventName];
    for(i in callbacks){
      callbacks[i]();
    }
    Bootsy.triggeredEvents.push(eventName);
  };

  Bootsy.after = function(eventName, callback){
    if(Bootsy.triggeredEvents.indexOf(eventName) != -1){
      callback();
    }else{
      Bootsy.on(eventName, callback);
    }
  };
  
  Bootsy.progressBar = function(element){
    element.find('div.modal-body').html('<div class="progress progress-striped active"><div class="bar" style="width: 100%;"></div></div>');
  };

  Bootsy.refreshGallery = function(element){
    element.find('a.refresh_btn').show().click();
  };

  Bootsy.openImageGallery = function(editor){
    editor.currentView.element.focus(false);
    Bootsy.caretBookmark = editor.composer.selection.getBookmark();
    $('#bootsy_image_gallery').modal('show');
  };

  Bootsy.insertImage = function(image, editor){
    $('#bootsy_image_gallery').modal('hide');
    editor.currentView.element.focus();
    if (Bootsy.caretBookmark) {
      editor.composer.selection.setBookmark(Bootsy.caretBookmark);
      Bootsy.caretBookmark = null;
    }
    editor.composer.commands.exec("insertImage", image);
  }

  Bootsy.alertUnsavedChanges = function(){
    if(Bootsy.unsavedChanges){  
      return Bootsy.translations[Bootsy.locale].alert_unsaved; 
    }
  };

  Bootsy.ready = function(){
    if($('textarea.bootsy_text_area').length > 0){
      Bootsy.locale = $('textarea.bootsy_text_area').attr('data-bootsy-locale') || $('html').attr('lang') || 'en';

      var templates = {
        customCommand: function(locale, options) {
          var size = (options && options.size) ? ' btn-'+options.size : '';
          return "<li>" +
            "<a class='btn" + size + "' data-wysihtml5-command='customCommand' title='" + locale.image.insert + "' tabindex='-1'><i class='icon-picture'></i></a>" +
          "</li>";
        },
      };

      Bootsy.editorOptions = {
        parserRules: {
          classes: {
            "wysiwyg-color-silver" : 1,
            "wysiwyg-color-gray" : 1,
            "wysiwyg-color-white" : 1,
            "wysiwyg-color-maroon" : 1,
            "wysiwyg-color-red" : 1,
            "wysiwyg-color-purple" : 1,
            "wysiwyg-color-fuchsia" : 1,
            "wysiwyg-color-green" : 1,
            "wysiwyg-color-lime" : 1,
            "wysiwyg-color-olive" : 1,
            "wysiwyg-color-yellow" : 1,
            "wysiwyg-color-navy" : 1,
            "wysiwyg-color-blue" : 1,
            "wysiwyg-color-teal" : 1,
            "wysiwyg-color-aqua" : 1,
            "wysiwyg-color-orange" : 1,
            "wysiwyg-float-left": 1,
            "wysiwyg-float-right": 1
          },

          tags: {
            "b":  {},
            "i":  {},
            "br": {},
            "ol": {},
            "ul": {},
            "li": {},
            "h1": {},
            "h2": {},
            "h3": {},
            "small": {},
            "p": {},
            "blockquote": {},
            "u": 1,
            "cite": {
              "check_attributes": {
                "title": "alt"
              }
            },
            "img": {
              "check_attributes": {
                "width": "numbers",
                "alt": "alt",
                "src": "src",
                "height": "numbers"
              },
              "add_class": {
                "align": "align_img"
              }
            },
            "a":  {
              set_attributes: {
                target: "_blank",
                rel:    "nofollow"
              },
              check_attributes: {
                href:   "url" // important to avoid XSS
              }
            },
            "span": 1,
            "div": 1,
            // to allow save and edit files with code tag hacks
            "code": 1,
            "pre": 1,

            //skomputer additions
            "em": {},
            "table": {},
            "th": {},
            "tr": {},
            "td": {},
            "strong" : {}
          }
        },
        color: true, 
        locale: Bootsy.locale, 
        customTemplates: templates
      };

      Bootsy.editorOptions.stylesheets = ["/assets/bootsy/bootsy.css"];

      if($('textarea.bootsy_text_area').attr('data-bootsy-image') == 'false'){
        Bootsy.editorOptions.image = false;
      }else{

        if($('textarea.bootsy_text_area').attr('data-bootsy-uploader') != 'false'){
          Bootsy.editorOptions.image = false;
          Bootsy.editorOptions.customCommand = true;
          Bootsy.editorOptions.customCommandCallback = Bootsy.openImageGallery;

          element = $('#bootsy_image_gallery');
        
          element.parents('form').after(element);

          element.on('click', 'a.refresh_btn', function(e){
            $(this).hide();
            Bootsy.progressBar(element);
          });

          element.find('a.destroy_btn').click(function(e){
            Bootsy.progressBar(element);
          });

          element.modal({show: false});
          element.on('shown', function(){
            Bootsy.refreshGallery(element);
          });

          element.on('hide', function() {
            Bootsy.editor.currentView.element.focus();
          });

          element.on('click.dismiss.modal', '[data-dismiss="modal"]', function(e) {
            e.stopPropagation();
          });

          element.on('click', 'ul.dropdown-menu a.insert', function(e){
            var imagePrefix = "/"+$(this).attr('data-image-size')+"_";
            if($(this).attr('data-image-size') == 'original'){
              imagePrefix = '/';
            }
            var img = $(this).parents('li.dropdown').find('img');
            var obj = {
              src: img.attr('src').replace("/thumb_", imagePrefix),
              alt: img.attr('alt').replace("Thumb_", "")
            };

            obj.align = $(this).attr('data-position');

            Bootsy.insertImage(obj, Bootsy.editor);
          });
        }
      }

      if($('textarea.bootsy_text_area').attr('data-bootsy-font-styles') == 'false') Bootsy.editorOptions['font-styles'] = false;
      if($('textarea.bootsy_text_area').attr('data-bootsy-emphasis') == 'false') Bootsy.editorOptions.emphasis = false;
      if($('textarea.bootsy_text_area').attr('data-bootsy-lists') == 'false') Bootsy.editorOptions.lists = false;
      if($('textarea.bootsy_text_area').attr('data-bootsy-html') == 'true') Bootsy.editorOptions.html = true;
      if($('textarea.bootsy_text_area').attr('data-bootsy-link') == 'false') Bootsy.editorOptions.link = false;
      if($('textarea.bootsy_text_area').attr('data-bootsy-color') == 'false') Bootsy.editorOptions.color = false;

      Bootsy.editor = $('textarea.bootsy_text_area').wysihtml5(Bootsy.editorOptions).data("wysihtml5").editor;

      if($('textarea.bootsy_text_area').attr('data-bootsy-alert-unsaved') != 'false'){
        window.onbeforeunload = Bootsy.alertUnsavedChanges;
      }

      Bootsy.editor.on("change", function(){
        Bootsy.unsavedChanges = true;
      });

      $('textarea.bootsy_text_area').closest('form').submit(function(e){
        Bootsy.unsavedChanges = false;
        return true;
      });

      Bootsy.trigger('loaded');
    }
  };

  return Bootsy;
}).call(this);

$(Bootsy.ready);