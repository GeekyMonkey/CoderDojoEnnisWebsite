using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CoderDojo
{
    public static class Extensions
    {
        public static string IntegerSuffix(this Int32 n)
        {
            int d = (n | 0) % 100;
            if (d > 3 && d < 21)
            {
                return "th";
            }
            switch (d % 10)
            {
                case 1:
                    return "st";
                case 2:
                    return "nd";
                case 3:
                    return "rd";
            }
            return "th";
        }
    }
}