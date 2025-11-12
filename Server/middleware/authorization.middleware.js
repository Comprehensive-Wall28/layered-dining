module.exports= function authorizationMiddleware(roles) {

    return (req, res, next) => {

        const userRole = req.user.role;
        
        console.log('=== AUTHORIZATION CHECK ===');
        console.log('Required roles:', roles);
        console.log('User role:', userRole);
        console.log('User object:', req.user);

        if (!roles.includes(userRole)){
            console.log('❌ Authorization FAILED');
            return res.status(403).json({message: "You are unauthorized to perform this action"});
        }
        console.log('✅ Authorization PASSED');
        next();
    };
}