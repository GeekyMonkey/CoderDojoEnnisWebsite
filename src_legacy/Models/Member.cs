using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CoderDojo
{
    public partial class Member : BaseEntity, IUser, IId
    {
        public string MemberName
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

        public bool AttendedToday
        {
            get;
            set;
        }

        public DateTime LastAttendance
        {
            get
            {
                DateTime lastAttendanceDate = new DateTime(2000, 1, 1);

                if (this.MemberAttendances.Any())
                {
                    var lastAttendance = this.MemberAttendances.OrderByDescending(ma => ma.Date).FirstOrDefault();
                    if (lastAttendance != null)
                    {
                        lastAttendanceDate = lastAttendance.Date;
                    }
                }

                return lastAttendanceDate;
            }
        }

        public string GetLoginMessage(bool isHtml)
        {
            List<string> messages = new List<string>();
            Int32 sessionCount = this.MemberAttendances.Count();

            // Welcome message
            if (LoginDatePrevious == null)
            {
                if (isHtml)
                {
                    messages.Add("<h3>Welcome " + FirstName + "</h3>");
                }
                else
                {
                    messages.Add("Welcome " + FirstName + "");
                }
            }
            else
            {
                if (isHtml)
                {
                    messages.Add("<h3>Welcome back " + FirstName + "</h3>");
                }
                else
                {
                    messages.Add("Welcome back " + FirstName + "");
                }
            }

            // Team 
            if (Team != null)
            {
                messages.Add("Your team is: " + Team.TeamName);
            }
            else
            {
                messages.Add("Contact a mentor to be assigned to a team.");
            }

            // Attendance
            if (LoginDatePrevious != null)
            {
                messages.Add("Your last login was at: " + LoginDatePrevious.Value.ToString("dd-MMM-yyyy HH:mm"));
            }
            messages.Add("This is your " + sessionCount + sessionCount.IntegerSuffix() + " CoderDojo session.");

            // Find belts awarded
            var newBelts = from mb in this.MemberBelts
                           where mb.Awarded >= (LoginDatePrevious ?? DateTime.Today.ToUniversalTime()).Date
                           orderby mb.Belt.SortOrder
                           select mb;
            foreach (var mb in newBelts)
            {
                string beltMessage;
                if (isHtml)
                {
                    beltMessage = "<p><strong>You have been awarded the <span style='color:" + mb.Belt.HexCode + ";'>" + mb.Belt.Color + "</span> belt!</strong>";
                    if (!string.IsNullOrEmpty(mb.AwardedNotes))
                    {
                        beltMessage += "<br /><em>" + mb.AwardedNotes + " - " + mb.AwardedByAdult.FullName + "</em>";
                    }
                    beltMessage += "</p>";
                } else
                {
                    beltMessage = "You have been awarded the " + mb.Belt.Color + " belt!";
                    if (!string.IsNullOrEmpty(mb.AwardedNotes))
                    {
                        beltMessage += "\r\n  " + mb.AwardedNotes + " - " + mb.AwardedByAdult.FullName + "";
                    }
                }
                messages.Add(beltMessage);
            }

            // Find belts rejected
            var rejectedBelts = from mb in this.MemberBelts
                           where mb.RejectedDate >= (LoginDatePrevious ?? DateTime.Today.ToUniversalTime()).Date
                           orderby mb.Belt.SortOrder
                           select mb;
            foreach (var mb in rejectedBelts)
            {
                string beltMessage;
                if (isHtml)
                {
                    beltMessage = "<p><strong>Your application for the <span style='color:" + mb.Belt.HexCode + ";'>" + mb.Belt.Color + "</span> belt has been rejected. You can apply again any time.</strong>";
                    if (!string.IsNullOrEmpty(mb.RejectedNotes))
                    {
                        beltMessage += "<br /><em>" + mb.RejectedNotes + " - " + mb.RejectedByAdult.FullName + "</em>";
                    }
                    beltMessage += "</p>";
                } else
                {
                    beltMessage = "Your application for the " + mb.Belt.Color + " belt has been rejected. You can apply again any time.";
                    if (!string.IsNullOrEmpty(mb.RejectedNotes))
                    {
                        beltMessage += "\r\n  " + mb.RejectedNotes + " - " + mb.RejectedByAdult.FullName;
                    }
                }
                messages.Add(beltMessage);
            }

            // Find badges awarded
            var newBadges = from mb in this.MemberBadges
                           where mb.Awarded >= (LoginDatePrevious ?? DateTime.Today.ToUniversalTime()).Date
                           orderby mb.Badge.BadgeCategory.CategoryName, mb.Badge.Achievement
                           select mb;
            foreach (var mb in newBadges)
            {
                string badgeMessage;
                if (isHtml)
                {
                    badgeMessage = "<p><strong>You have been awarded the " + mb.Badge.BadgeCategory.CategoryName + " - " + mb.Badge.Achievement + " badge.</strong>";
                    if (!string.IsNullOrEmpty(mb.AwardedNotes))
                    {
                        badgeMessage += "<br /><em>" + mb.AwardedNotes + " - " + mb.AwardedByAdult.FullName + "</em>";
                    }
                    badgeMessage += "</p>";
                } else
                {
                    badgeMessage = "You have been awarded the " + mb.Badge.BadgeCategory.CategoryName + " - " + mb.Badge.Achievement + " badge.";
                    if (!string.IsNullOrEmpty(mb.AwardedNotes))
                    {
                        badgeMessage += "\r\n  " + mb.AwardedNotes + " - " + mb.AwardedByAdult.FullName;
                    }
                }
                messages.Add(badgeMessage);
            }

            // Find badges rejected
            // exclude badges that have been re-applied for
            var appliedBadgeIds = from mb in this.MemberBadges
                                  where mb.RejectedDate == null && mb.Awarded == null
                                  select mb.BadgeId;
            var rejectedBadges = from mb in this.MemberBadges
                            where mb.RejectedDate >= (LoginDatePrevious ?? DateTime.Today.ToUniversalTime()).Date
                            && !appliedBadgeIds.Contains(mb.BadgeId)
                            orderby mb.Badge.BadgeCategory.CategoryName, mb.Badge.Achievement
                            select mb;
            foreach (var mb in rejectedBadges)
            {
                string badgeMessage;
                if (isHtml)
                {
                    badgeMessage = "<p><strong>Your application for the " + mb.Badge.BadgeCategory.CategoryName + " - " + mb.Badge.Achievement + " badge has been rejected. You can apply again any time.</strong>";
                    if (!string.IsNullOrEmpty(mb.RejectedNotes))
                    {
                        badgeMessage += "<br /><em>" + mb.RejectedNotes + " - " + mb.RejectedByAdult.FullName + "</em>";
                    }
                    badgeMessage += "</p>";
                } else
                {
                    badgeMessage = "Your application for the " + mb.Badge.BadgeCategory.CategoryName + " - " + mb.Badge.Achievement + " badge has been rejected. You can apply again any time.";
                    if (!string.IsNullOrEmpty(mb.RejectedNotes))
                    {
                        badgeMessage += "\r\n  " + mb.RejectedNotes + " - " + mb.RejectedByAdult.FullName;
                    }
                }
                messages.Add(badgeMessage);
            }

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

        public string BeltColorHex
        {
            get
            {
                string hex = "transparent";
                if (this.MemberBelts.Any())
                {
                    var belt =this.MemberBelts.Where(mb => mb.Awarded != null).OrderByDescending(mb => mb.Awarded).FirstOrDefault();
                    if (belt != null)
                    {
                        hex = belt.Belt.HexCode;
                    }
                }
                return hex;
            }
        }

        public List<MemberBadgeCategory> GetBadgeCategories()
        {
            var mbcs = this.MemberBadges.Where(b => b.Awarded != null).GroupBy(b => b.Badge.BadgeCategory)
                      .Select(g => new MemberBadgeCategory { BadgeCategory = g.Key, BadgeCount = g.Count() })
                      .OrderByDescending(b => b.BadgeCount)
                      .ToList();
            return mbcs;
        }
    }
}
