// Generated by CoffeeScript 1.3.1
(function() {
  var __slice = [].slice;

  require(['coffee-script', 'jquery', 'nodeutil'], function(CoffeeScript, $, nodeutil) {
    return $(function() {
      var $input, $inputcopy, $inputdiv, $inputl, $inputr, $output, $prompt, CoffeeREPL, DEFAULT_LAST_VARIABLE, HEADER, SAVED_CONSOLE_LOG, log, repl, resizeInput, scrollToBottom;
      SAVED_CONSOLE_LOG = console.log;
      DEFAULT_LAST_VARIABLE = '$_';
      $output = $('#output');
      $input = $('#input');
      $prompt = $('#prompt');
      $inputdiv = $('#inputdiv');
      $inputl = $('#inputl');
      $inputr = $('#inputr');
      $inputcopy = $('#inputcopy');
      CoffeeREPL = (function() {

        CoffeeREPL.name = 'CoffeeREPL';

        function CoffeeREPL(output, input, prompt, settings) {
          var k, v;
          this.output = output;
          this.input = input;
          this.prompt = prompt;
          if (settings == null) {
            settings = {};
          }
          this.history = [];
          this.historyi = -1;
          this.saved = '';
          this.multiline = false;
          this.settings = {
            lastVariable: DEFAULT_LAST_VARIABLE
          };
          for (k in settings) {
            v = settings[k];
            this.settings[k] = v;
          }
        }

        CoffeeREPL.prototype.print = function() {
          var args, s;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          s = args.join(' ') || ' ';
          return this.output.append("<pre>" + s + "</pre>");
        };

        CoffeeREPL.prototype.grabInput = function() {
          var tmp;
          tmp = this.input.val();
          $input.val('');
          return tmp;
        };

        CoffeeREPL.prototype.processSaved = function() {
          var compiled, ouput, output, value;
          try {
            compiled = CoffeeScript.compile(this.saved);
            compiled = compiled.slice(14, -17);
            value = eval.call(window, compiled);
            window[this.settings.lastVariable] = value;
            output = nodeutil.inspect(value);
          } catch (e) {
            if (e.stack) {
              output = e.stack;
              if (output.split('\n')[0] !== e.toString()) {
                ouput = "" + (e.toString()) + "\n" + e.stack;
              }
            } else {
              output = e.toString();
            }
          }
          this.saved = '';
          return this.print(output);
        };

        CoffeeREPL.prototype.setPrompt = function() {
          var s;
          s = this.multiline ? '------' : 'coffee';
          return this.prompt.html("" + s + "&gt;&nbsp;");
        };

        CoffeeREPL.prototype.addToHistory = function(s) {
          this.history.unshift(s);
          return this.historyi = -1;
        };

        CoffeeREPL.prototype.addToSaved = function(s) {
          this.saved += s.slice(0, -1) === '\\' ? s.slice(0, -1) : s;
          this.saved += '\n';
          return this.addToHistory(s);
        };

        CoffeeREPL.prototype.handleKeypress = function(e) {
          var input;
          switch (e.which) {
            case 13:
              e.preventDefault();
              input = this.grabInput();
              this.print(this.prompt.html() + input);
              if (input) {
                this.addToSaved(input);
                if (input.slice(0, -1) !== '\\' && !this.multiline) {
                  return this.processSaved();
                }
              }
              break;
            case 27:
              e.preventDefault();
              input = this.input.val();
              if (input && this.multiline && this.saved) {
                input = this.grabInput();
                this.print(this.prompt.html() + input);
                this.addToSaved(input);
                this.processSaved();
              } else if (this.multiline && this.saved) {
                this.processSaved();
              }
              this.multiline = !this.multiline;
              return this.setPrompt();
            case 38:
              e.preventDefault();
              if (this.historyi < this.history.length - 1) {
                this.historyi += 1;
                return this.input.val(this.history[this.historyi]);
              }
              break;
            case 40:
              e.preventDefault();
              if (this.historyi > 0) {
                this.historyi += -1;
                return this.input.val(this.history[this.historyi]);
              }
          }
        };

        return CoffeeREPL;

      })();
      resizeInput = function(e) {
        var content, width;
        width = $inputdiv.width() - $inputl.width();
        content = $input.val();
        content.replace(/\n/g, '<br/>');
        $inputcopy.html(content);
        $inputcopy.width(width);
        $input.width(width);
        return $input.height($inputcopy.height());
      };
      scrollToBottom = function() {
        return window.scrollTo(0, $prompt[0].offsetTop);
      };
      repl = new CoffeeREPL($output, $input, $prompt);
      log = function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        SAVED_CONSOLE_LOG.apply(console, args);
        return repl.print.apply(repl, args);
      };
      console.log = log;
      $input.keydown(function(e) {
        return repl.handleKeypress(e);
      });
      $input.keydown(scrollToBottom);
      $(window).resize(resizeInput);
      $input.keyup(resizeInput);
      $input.change(resizeInput);
      $('html').click(function(e) {
        if (e.clientY > $input[0].offsetTop) {
          return $input.focus();
        }
      });
      resizeInput();
      $input.focus();
      HEADER = ["# CoffeeScript v1.3.1 REPL", "# https://github.com/larryng/coffeescript-repl", "#", "# Press Esc to toggle multiline mode.", "# Variable `" + repl.settings.lastVariable + "` stores last returned value.", " "].join('\n');
      return repl.print(HEADER);
    });
  });

}).call(this);
