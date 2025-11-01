using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CoderDojo
{
    public interface IId
    {
        Guid Id { get; set; }
    }

    public interface IUser
    {
        string FirstName { get; set; }
        string LastName { get; set; }
        DateTime? LoginDate { get; set; }
        DateTime? LoginDatePrevious { get; set; }
    }

    public static class UserExtensions
    {
        public static void SetLoginDate(this IUser user)
        {
            user.LoginDatePrevious = user.LoginDate;
            user.LoginDate = DateTime.UtcNow;
        }
    }
}
