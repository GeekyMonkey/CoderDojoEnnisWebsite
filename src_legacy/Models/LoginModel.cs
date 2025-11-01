using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace CoderDojo
{
    public class LoginModel
    {
        public LoginModel()
        {
            Username = "";
            Password = "";
            Remember = false;
        }

        [Required]
        public string Username { get; set; }

        [Required]
        public string Password { get; set; }

        public bool Remember { get; set; }

        public string ReturnUrl { get; set; }
    }
}