(function ($, undefined) {
  $.widget("jb.overflowmenu", {
    options: {
      items: "> *",
      itemsParentTag: "ul",
      label: '<i class="icon-ellipsis-vertical"></i>',
      refreshOn: $(window),
      guessHeight: true,
    },

    // 🔥 FIXED FUNCTION
    moveNewTicketToLast: function () {
      var $item = this.primaryMenu.find("a#new-ticket").closest("li");

      if ($item.length) {
        $item.detach().appendTo(this.primaryMenu); // keep events

        // assign id safely
        $item.attr("id", "new-ticket-btn");
      }
    },

    _create: function () {
      var self = this;

      this.element.addClass("jb-overflowmenu");

      this.primaryMenu = this.element
        .children(this.options.itemsParentTag)
        .addClass(
          "jb-overflowmenu-menu jb-overflowmenu-menu-primary jb-overflowmenu-helper-postion",
        );

      this._setHeight();

      this.secondaryMenuContainer = $(
        [
          '<div class="jb-overflowmenu-container jb-overflowmenu-helper-postion">',
          '<a href="javascript://" class="jb-overflowmenu-menu-secondary-handle"></a>',
          "<" +
            this.options.itemsParentTag +
            ' class="jb-overflowmenu-menu jb-overflowmenu-menu-secondary jb-overflowmenu-helper-postion"></' +
            this.options.itemsParentTag +
            ">",
          "</div>",
        ].join(""),
      ).appendTo(this.element);

      this.secondaryMenu = this.secondaryMenuContainer.find("ul");

      this.secondaryMenuContainer
        .children("a")
        .bind("click.overflowmenu", function () {
          self.toggle();
        });

      this._setOption("label", this.options.label);
      this._setOption("refreshOn", this.options.refreshOn);

      // 🔥 INITIAL LOAD
      setTimeout(function () {
        self.refresh();
      }, 50);
    },

    destroy: function () {
      this.element.removeClass("jb-overflowmenu");

      this.primaryMenu
        .removeClass(
          "jb-overflowmenu-menu-primary jb-overflowmenu-helper-postion",
        )
        .find(this.options.items)
        .filter(":hidden")
        .css("display", "");

      this.options.refreshOn.unbind("resize.overflowmenu");

      this.secondaryMenuContainer.remove();

      $.Widget.prototype.destroy.apply(this, arguments);
    },

    refresh: function () {
      this._trigger("beforeChange", {}, this._uiHash());

      this.primaryMenuWidth = this.options.width || this.element.innerWidth();

      // 🔥 reset items
      this.secondaryMenu.children().appendTo(this.primaryMenu);

      // 🔥 IMPORTANT: keep it last AFTER reset
      this.moveNewTicketToLast();

      var hWidth = this.secondaryMenuContainer
          .find(".jb-overflowmenu-menu-secondary-handle")
          .outerWidth(),
        vWidth = this.primaryMenuWidth - hWidth,
        previousRight = this.primaryMenu.offset().left;

      this._getItems().each(function () {
        var $this = $(this);
        if ($this.hasClass("primary-only")) vWidth -= $this.outerWidth(true);
      });

      var itemsToHide = this._getItems().filter(function () {
        var $this = $(this),
          left = $this.offset().left,
          dLeft = Math.max(0, left - previousRight);

        previousRight = left + $this.width();

        if ($this.hasClass("primary-only")) return false;

        vWidth -= dLeft + $this.outerWidth(true);

        return vWidth < 1;
      });

      itemsToHide.appendTo(this.secondaryMenu);

      if (itemsToHide.length === 0) {
        this.close();
      }

      this._trigger("change", {}, this._uiHash());

      return this;
    },

    open: function () {
      if (this.secondaryMenu.find(this.options.items).length == 0) {
        return;
      }
      this.primaryMenu.css("right", this.primaryMenu.data("right"));
      this.secondaryMenu.show();
      this._trigger("open", {}, this._uiHash());
      return this;
    },

    close: function () {
      this.secondaryMenu.hide();
      this._trigger("close", {}, this._uiHash());
      return this;
    },

    toggle: function () {
      if (this.secondaryMenu.is(":visible")) {
        this.close();
      } else {
        this.open();
      }
      return this;
    },

    _getItems: function () {
      return this.primaryMenu.find(this.options.items);
    },

    _setHeight: function () {
      if (this.options.guessHeight) {
        this.primaryMenuHeight = this.primaryMenu
          .find(this.options.items)
          .filter(":first")
          .outerHeight();

        this.primaryMenu.css("height", this.primaryMenuHeight);
      } else {
        this.primaryMenuHeight = this.element.innerHeight();
      }

      this.primaryMenuWidth = this.options.width || this.element.innerWidth();
    },

    _setOption: function (key, value) {
      var self = this;

      if (key == "refreshOn" && value) {
        this.options.refreshOn.unbind("resize.overflowmenu");

        var timer;

        this.options.refreshOn = $(value).on(
          "resize.overflowmenu",
          function () {
            clearTimeout(timer);
            timer = setTimeout(function () {
              self.refresh();
            }, 120);
          },
        );

        self.refresh();
      } else if (key == "label" && value) {
        var width = this.secondaryMenuContainer
          .find(".jb-overflowmenu-menu-secondary-handle")
          .html(value)
          .outerWidth();

        this.primaryMenu.data("right", width);
      }

      $.Widget.prototype._setOption.apply(this, arguments);
    },

    _uiHash: function () {
      return {
        primary: this.primaryMenu,
        secondary: this.secondaryMenu,
        container: this.secondaryMenuContainer,
      };
    },
  });
})(jQuery);
