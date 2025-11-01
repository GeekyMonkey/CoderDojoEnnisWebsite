using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CoderDojo
{
    public class ApiAdult : BaseApiEntity  // , IUser
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public bool IsParent { get; set; }
        public bool IsMentor { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string Login { get; set; }
        //public string PasswordHash { get; set; }
        public string GithubLogin { get; set; }
        public string XboxGamertag { get; set; }
        public string ScratchName { get; set; }
        public bool Deleted { get; set; }
        public bool GardaVetted { get; set; }
        public Nullable<System.DateTime> LoginDate { get; set; }
        //public Nullable<System.DateTime> LoginDatePrevious { get; set; }
    }
}
