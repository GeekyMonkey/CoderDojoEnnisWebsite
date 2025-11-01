using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CoderDojo
{
    public partial class Adult : BaseEntity, IUser, IId
    {
        public string FullName
        {
            get
            {
                return FirstName + " " + LastName;
            }
        }

        public string NewPassword
        {
            get;
            set;
        }

        public List<Guid> BadgeCategoriesSelected
        {
            get;
            set;
        }

        public string GetLoginMessage(bool isHtml)
        {
            List<string> messages = new List<string>();
            Int32 sessionCount = this.AdultAttendances.Count();

            // Welcome message
            if (LoginDatePrevious == null)
            {
                if (isHtml)
                {
                    messages.Add("<h3>Welcome " + FirstName + "</h3>");
                } else
                {
                    messages.Add("Welcome " + FirstName);
                }
            }
            else
            {
                if (isHtml)
                {
                    messages.Add("<h3>Welcome back " + FirstName + "</h3>");
                } else
                {
                    messages.Add("Welcome back " + FirstName + "");
                }
            }

            // Team 
            messages.Add("Your team is: Mentors!");

            // Attendance
            if (LoginDatePrevious != null)
            {
                messages.Add("Your last login was at: " + LoginDatePrevious.Value.ToString("dd-MMM-yyyy HH:mm"));
            }
            messages.Add("This is your " + sessionCount + sessionCount.IntegerSuffix() + " CoderDojo session.");

            if (isHtml)
            {
                string html = "";
                foreach (string message in messages)
                {
                    if (message.StartsWith("<"))
                    {
                        html += message;
                    }
                    else
                    {
                        html += "<p>" + message + "</p>";
                    }
                }
                return html;
            } else
            {
                return string.Join("\r\n", messages);
            }
        }
    }
}