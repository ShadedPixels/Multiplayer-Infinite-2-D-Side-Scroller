﻿using System.Linq;
using System.Security.Claims;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin;
using Microsoft.Owin.Security;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Threading.Tasks;
using System.Web;

namespace Infinite_Sidescroller.Models
{
  // Configure the application user manager used in this application. UserManager is defined in ASP.NET Identity and is used by the application.

  public class ApplicationUserManager : UserManager<ApplicationUser>
  {
    private UserStore<ApplicationUser> Store_;
    public UserStore<ApplicationUser> Store
    {
      get { return Store_; }
    }

    public ApplicationUserManager(UserStore<ApplicationUser> store)
      : base(store)
    {
      this.Store_ = store;
    }

    public static ApplicationUserManager Create(IdentityFactoryOptions<ApplicationUserManager> options, IOwinContext context)
    {
      var manager = new ApplicationUserManager(new UserStore<ApplicationUser>(context.Get<ApplicationDbContext>()));
      // Configure validation logic for usernames
      manager.UserValidator = new UserValidator<ApplicationUser>(manager)
      {
        AllowOnlyAlphanumericUserNames = false,
        RequireUniqueEmail = true
      };
      // Configure validation logic for passwords
      manager.PasswordValidator = new PasswordValidator
      {
        RequiredLength = 6,
        RequireNonLetterOrDigit = false,
        RequireDigit = true,
        RequireLowercase = true,
        RequireUppercase = true,
      };
      // Configure user lockout defaults
      manager.UserLockoutEnabledByDefault = true;
      manager.DefaultAccountLockoutTimeSpan = TimeSpan.FromMinutes(30);
      manager.MaxFailedAccessAttemptsBeforeLockout = 5;
      // Register two factor authentication providers. This application uses Phone and Emails as a step of receiving a code for verifying the user
      // You can write your own provider and plug in here.
      manager.RegisterTwoFactorProvider("PhoneCode", new PhoneNumberTokenProvider<ApplicationUser>
      {
        MessageFormat = "Your security code is: {0}"
      });
      manager.RegisterTwoFactorProvider("EmailCode", new EmailTokenProvider<ApplicationUser>
      {
        Subject = "SecurityCode",
        BodyFormat = "Your security code is {0}"
      });
      manager.EmailService = new EmailService();
      manager.SmsService = new SmsService();
      var dataProtectionProvider = options.DataProtectionProvider;
      if (dataProtectionProvider != null)
      {
        manager.UserTokenProvider = new DataProtectorTokenProvider<ApplicationUser>(dataProtectionProvider.Create("ASP.NET Identity"));
      }
      return manager;
    }

    /// <summary>
    /// Method to add user to multiple roles
    /// </summary>
    /// <param name="userId">user id</param>
    /// <param name="roles">list of role names</param>
    /// <returns></returns>
    public virtual async Task<IdentityResult> AddUserToRolesAsync(string userId, IList<string> roles)
    {
      var userRoleStore = (IUserRoleStore<ApplicationUser, string>)Store;

      var user = await FindByIdAsync(userId).ConfigureAwait(false);
      if (user == null)
      {
        throw new InvalidOperationException("Invalid user Id");
      }

      var userRoles = await userRoleStore.GetRolesAsync(user).ConfigureAwait(false);
      // Add user to each role using UserRoleStore
      foreach (var role in roles.Where(role => !userRoles.Contains(role)))
      {
        await userRoleStore.AddToRoleAsync(user, role).ConfigureAwait(false);
      }

      // Call update once when all roles are added
      return await UpdateAsync(user).ConfigureAwait(false);
    }

    /// <summary>
    /// Remove user from multiple roles
    /// </summary>
    /// <param name="userId">user id</param>
    /// <param name="roles">list of role names</param>
    /// <returns></returns>
    public virtual async Task<IdentityResult> RemoveUserFromRolesAsync(string userId, IList<string> roles)
    {
      var userRoleStore = (IUserRoleStore<ApplicationUser, string>)Store;

      var user = await FindByIdAsync(userId).ConfigureAwait(false);
      if (user == null)
      {
        throw new InvalidOperationException("Invalid user Id");
      }

      var userRoles = await userRoleStore.GetRolesAsync(user).ConfigureAwait(false);
      // Remove user to each role using UserRoleStore
      foreach (var role in roles.Where(userRoles.Contains))
      {
        await userRoleStore.RemoveFromRoleAsync(user, role).ConfigureAwait(false);
      }

      // Call update once when all roles are removed
      return await UpdateAsync(user).ConfigureAwait(false);
    }
  }

  // Configure the RoleManager used in the application. RoleManager is defined in the ASP.NET Identity core assembly
  public class ApplicationRoleManager : RoleManager<IdentityRole>
  {
    public ApplicationRoleManager(IRoleStore<IdentityRole, string> roleStore)
      : base(roleStore)
    {
    }

    public static ApplicationRoleManager Create(IdentityFactoryOptions<ApplicationRoleManager> options, IOwinContext context)
    {
      var manager = new ApplicationRoleManager(new RoleStore<IdentityRole>(context.Get<ApplicationDbContext>()));

      return manager;
    }
  }

  public class EmailService : IIdentityMessageService
  {
    public Task SendAsync(IdentityMessage message)
    {
      // Plug in your email service here to send an email.
      return Task.FromResult(0);
    }
  }

  public class SmsService : IIdentityMessageService
  {
    public Task SendAsync(IdentityMessage message)
    {
      // Plug in your sms service here to send a text message.
      return Task.FromResult(0);
    }
  }

  // This is useful if you do not want to tear down the database each time you run the application.
  // public class ApplicationDbInitializer : DropCreateDatabaseAlways<ApplicationDbContext>
  // This example shows you how to create a new database if the Model changes
  public class ApplicationDbInitializer : DropCreateDatabaseIfModelChanges<ApplicationDbContext>
  {
    protected override void Seed(ApplicationDbContext context)
    {
      //InitializeIdentityForEF(context);
      base.Seed(context);
    }

    ////Create User=Admin@Admin.com with password=Admin@123456 in the Admin role        
    //public static void InitializeIdentityForEF(ApplicationDbContext db)
    //{
    //  return;

    //  var userManager = HttpContext.Current.GetOwinContext().GetUserManager<ApplicationUserManager>();
    //  var roleManager = HttpContext.Current.GetOwinContext().Get<ApplicationRoleManager>();
    //  const string name = "ali990";

    //  const string password = "Admin@123456";
    //  const string roleName = "Admin";

    //  //Create Role Admin if it does not exist
    //  var role = roleManager.FindByName(roleName);
    //  if (role == null)
    //  {
    //    role = new IdentityRole(roleName);
    //    var roleresult = roleManager.Create(role);
    //  }

    //  var user = userManager.FindByName(name);
    //  if (user == null)
    //  {
    //    user = new ApplicationUser { Email = email, UserName = name, DisplayName = displayname };
    //    var result = userManager.Create(user, password);
    //    result = userManager.SetLockoutEnabled(user.Id, false);
    //  }

    //  // Add user admin to Role Admin if not already added
    //  var rolesForUser = userManager.GetRoles(user.Id);
    //  if (!rolesForUser.Contains(role.Name))
    //  {
    //    var result = userManager.AddToRole(user.Id, role.Name);
    //  }
    //}
  }

  public enum SignInStatus
  {
    Success,
    Failure
  }

  // These help with sign and two factor (will possibly be moved into identity framework itself)
  public class SignInHelper
  {
    public SignInHelper(ApplicationUserManager userManager, IAuthenticationManager authManager)
    {
      UserManager = userManager;
      AuthenticationManager = authManager;
    }

    public ApplicationUserManager UserManager { get; private set; }
    public IAuthenticationManager AuthenticationManager { get; private set; }

    public async Task SignInAsync(ApplicationUser user, bool isPersistent, bool rememberBrowser)
    {
      // Clear any partial cookies from external or two factor partial sign ins
      AuthenticationManager.SignOut(DefaultAuthenticationTypes.ExternalCookie, DefaultAuthenticationTypes.TwoFactorCookie);
      var userIdentity = await user.GenerateUserIdentityAsync(UserManager);
      if (rememberBrowser)
      {
        var rememberBrowserIdentity = AuthenticationManager.CreateTwoFactorRememberBrowserIdentity(user.Id);
        AuthenticationManager.SignIn(new AuthenticationProperties { IsPersistent = isPersistent }, userIdentity, rememberBrowserIdentity);
      }
      else
      {
        AuthenticationManager.SignIn(new AuthenticationProperties { IsPersistent = isPersistent }, userIdentity);
      }
    }

    public async Task<SignInStatus> ExternalSignIn(ExternalLoginInfo loginInfo, bool isPersistent)
    {
      var user = await UserManager.FindAsync(loginInfo.Login);
      if (user == null)
      {
        return SignInStatus.Failure;
      }
      await SignInAsync(user, isPersistent, false);
      return SignInStatus.Success;
    }

    // local accounts only
    public async Task<SignInStatus> PasswordSignIn(string userName, string password, bool isPersistent, bool shouldLockout)
    {
      var user = await UserManager.FindByNameAsync(userName);
      if (user == null)
      {
        return SignInStatus.Failure;
      }
      await SignInAsync(user, isPersistent, false);
      return SignInStatus.Success;
    }
  }
}