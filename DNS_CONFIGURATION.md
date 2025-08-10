# 🌐 DNS Configuration Guide - cognomega.com & www.cognomega.com

## 📋 Required DNS Records

After deploying your application, you'll need to configure these DNS records at your domain registrar:

### **Primary Domain (cognomega.com)**
```
Type: A
Name: @ (or leave blank)
Value: [Replit's IP Address - provided after deployment]
TTL: 300 (5 minutes) or Auto
```

### **WWW Subdomain (www.cognomega.com)**
```
Type: CNAME
Name: www
Value: cognomega.com (or the full domain provided by Replit)
TTL: 300 (5 minutes) or Auto
```

### **Domain Verification**
```
Type: TXT
Name: @ (or leave blank)
Value: [Verification string provided by Replit]
TTL: 300 (5 minutes) or Auto
```

## 🔧 Popular Domain Registrar Instructions

### **GoDaddy**
1. Log into GoDaddy account
2. Go to **My Products** → **All Products and Services** → **DNS**
3. Find cognomega.com and click **Manage**
4. Add the A, CNAME, and TXT records as specified above
5. Save changes

### **Namecheap**
1. Log into Namecheap account
2. Go to **Domain List** → click **Manage** next to cognomega.com
3. Go to **Advanced DNS** tab
4. Add the A, CNAME, and TXT records
5. Save all changes

### **Cloudflare** (if using Cloudflare DNS)
1. Log into Cloudflare dashboard
2. Select cognomega.com domain
3. Go to **DNS** → **Records**
4. Add the A, CNAME, and TXT records
5. Set proxy status to "DNS only" (gray cloud) initially
6. Save changes

### **Google Domains**
1. Sign in to Google Domains
2. Select cognomega.com
3. Click **DNS** on the left sidebar
4. Scroll to **Custom resource records**
5. Add the A, CNAME, and TXT records
6. Save

## ✅ Verification Process

### **Check DNS Propagation**
Use these tools to verify DNS propagation:
- **whatsmydns.net**: Check global DNS propagation
- **dnschecker.org**: Verify DNS records worldwide
- **nslookup**: Command-line DNS lookup

### **Expected Results**
- `cognomega.com` should resolve to Replit's IP address
- `www.cognomega.com` should resolve via CNAME to cognomega.com
- Both domains should serve your application over HTTPS

### **Troubleshooting**
- **DNS not propagating**: Wait up to 48 hours for full propagation
- **SSL certificate issues**: May take additional time after DNS verification
- **404 errors**: Ensure deployment is active and domain is verified in Replit
- **Redirect loops**: Check for conflicting CNAME records

## 🚀 Post-Configuration

### **SEO Benefits**
- **Canonical URLs**: Both domains will serve the same content
- **HTTPS Redirect**: Automatic SSL encryption for security
- **WWW Preference**: Choose primary domain for consistency
- **Search Engine Indexing**: Better visibility with proper domain setup

### **User Experience**
- **Accessibility**: Users can reach your site via both URLs
- **Branding**: Professional appearance with custom domain
- **Trust**: HTTPS encryption builds user confidence
- **Performance**: Optimized delivery through Replit's infrastructure

### **Analytics Setup**
After DNS verification, configure:
- **Google Analytics**: Track traffic from both domains
- **Search Console**: Verify both domain versions
- **Social Media**: Update links to use primary domain
- **Marketing Materials**: Use canonical domain (cognomega.com)

## 📊 Expected Timeline

### **Immediate (0-5 minutes)**
- DNS records added to registrar
- Replit deployment verification begins

### **Quick Propagation (5-30 minutes)**
- Primary DNS servers update
- Basic domain resolution works

### **Full Propagation (2-48 hours)**
- Global DNS propagation complete
- SSL certificates fully active
- All features operational

## 🎯 Success Verification

### **Test Both Domains**
1. **https://cognomega.com** - Should load your application
2. **https://www.cognomega.com** - Should load your application
3. **http://cognomega.com** - Should redirect to HTTPS
4. **http://www.cognomega.com** - Should redirect to HTTPS

### **Final Checklist**
- [ ] A record for cognomega.com points to Replit
- [ ] CNAME record for www.cognomega.com points to cognomega.com
- [ ] TXT record for domain verification is added
- [ ] DNS propagation is complete globally
- [ ] SSL certificates are active for both domains
- [ ] Application loads correctly on both URLs
- [ ] Authentication and payments work properly
- [ ] AI models respond correctly
- [ ] Mobile responsiveness confirmed

Your domain configuration is now complete and ready for global access!