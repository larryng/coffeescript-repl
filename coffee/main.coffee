# In-browser CoffeeScript REPL
# https://github.com/larryng/coffeescript-repl
# 
# written by Larry Ng

require ['jquery', 'coffee-script', 'nodeutil'], ($, CoffeeScript, nodeutil) ->

  $ ->
    SAVED_CONSOLE_LOG = console.log
    DEFAULT_LAST_VARIABLE = '$_'
    
    $output    = $('#output')
    $input     = $('#input')
    $prompt    = $('#prompt')
    $inputdiv  = $('#inputdiv')
    $inputl    = $('#inputl')
    $inputr    = $('#inputr')
    $inputcopy = $('#inputcopy')
    
    
    escapeHTML = (s) ->
      s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    
    
    class CoffeeREPL
      constructor: (@output, @input, @prompt, settings={}) ->
        @history = []
        @historyi = -1
        @saved = ''
        @multiline = false
        
        @settings =
          lastVariable: DEFAULT_LAST_VARIABLE
        
        for k, v of settings
          @settings[k] = v
      
      print: (args...) =>
        s = args.join(' ') or ' '
        @output[0].innerHTML += "<pre>#{s}</pre>"
        undefined
      
      grabInput: =>
        tmp = @input.val()
        $input.val ''
        tmp
      
      processSaved: =>
        try
          compiled = CoffeeScript.compile @saved
          compiled = compiled[14...-17]
          value = eval.call window, compiled
          window[@settings.lastVariable] = value
          output = nodeutil.inspect value, undefined, undefined, true
        catch e
          if e.stack
            output = e.stack
            
            # FF doesn't have Error.toString() as the first line of Error.stack
            # while Chrome does.
            if output.split('\n')[0] isnt e.toString()
              ouput = "#{e.toString()}\n#{e.stack}"
          else
            output = e.toString()
        @saved = ''
        @print output
      
      setPrompt: =>
        s = if @multiline then '------' else 'coffee'
        @prompt.html "#{s}&gt;&nbsp;"
      
      addToHistory: (s) =>
        @history.unshift s
        @historyi = -1
      
      addToSaved: (s) =>
        @saved += if s[...-1] is '\\' then s[0...-1] else s
        @saved += '\n'
        @addToHistory s
      
      clear: =>
        @output[0].innerHTML = ''
        undefined
      
      handleKeypress: (e) =>
        switch e.which
          when 13
            e.preventDefault()
            input = @grabInput()
            
            @print @prompt.html() + escapeHTML(input)
            
            if input
              @addToSaved input
              if input[...-1] isnt '\\' and not @multiline
                @processSaved()
          
          when 27
            e.preventDefault()
            input = @input.val()
            
            if input and @multiline and @saved
              input = @grabInput()
              
              @print @prompt.html() + escapeHTML(input)
              @addToSaved input
              @processSaved()
            else if @multiline and @saved
              @processSaved()
            
            @multiline = not @multiline
            @setPrompt()
          
          when 38
            e.preventDefault()
            
            if @historyi < @history.length-1
              @historyi += 1
              @input.val @history[@historyi]
          
          when 40
            e.preventDefault()
            
            if @historyi > 0
              @historyi += -1
              @input.val @history[@historyi]
    
    
    resizeInput = (e) ->
      width = $inputdiv.width() - $inputl.width()
      content = $input.val()
      content.replace /\n/g, '<br/>'
      $inputcopy.html content
      
      $inputcopy.width width
      $input.width width
      $input.height $inputcopy.height()
    
    
    scrollToBottom = ->
      window.scrollTo 0, $prompt[0].offsetTop
    
    
    init = ->
      
      # instantiate our REPL
      repl = new CoffeeREPL $output, $input, $prompt
      
      # replace console.log
      log = (args...) ->
        SAVED_CONSOLE_LOG.apply console, args
        repl.print args...
      
      console.log = log
      
      # set clear()
      window.clear = repl.clear
      
      # bind handlers
      $input.keydown (e) -> repl.handleKeypress e
      $input.keydown scrollToBottom
      
      $(window).resize resizeInput
      $input.keyup resizeInput
      $input.change resizeInput
      
      $('html').click (e) ->
        if e.clientY > $input[0].offsetTop
          $input.focus()
      
      # initialize window
      resizeInput()
      $input.focus()
      
      # print header
      HEADER = [
        "# CoffeeScript v1.3.1 REPL"
        "# <a href=\"https://github.com/larryng/coffeescript-repl\" target=\"_blank\">https://github.com/larryng/coffeescript-repl</a>"
        "#"
        "# Tips:"
        "#   - Press Esc to toggle multiline mode."
        "#   - #{repl.settings.lastVariable} stores last returned value."
        "#   - clear() clears the console."
        " "
      ].join('\n')
      
      repl.print HEADER
    
    
    init()