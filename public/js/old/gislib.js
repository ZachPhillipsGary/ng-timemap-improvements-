

   // from https://github.com/DmitryBaranovskiy/raphael
      function bounce(t) {
        var s = 7.5625, p = 2.75, l;
        if (t < (1 / p)) {
          l = s * t * t;
        } else {
          if (t < (2 / p)) {
            t -= (1.5 / p);
            l = s * t * t + 0.75;
          } else {
            if (t < (2.5 / p)) {
              t -= (2.25 / p);
              l = s * t * t + 0.9375;
            } else {
              t -= (2.625 / p);
              l = s * t * t + 0.984375;
            }
          }
        }
        return l;
      }

      // from https://github.com/DmitryBaranovskiy/raphael
      function elastic(t) {
        return Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1;
      }
