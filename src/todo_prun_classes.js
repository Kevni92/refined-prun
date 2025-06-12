           , Gle = function() {
            function e(t, n, r) {
                !function(e, t) {
                    if (!(e instanceof t))
                        throw new TypeError("Cannot call a class as a function")
                }(this, e),
                Wle(this, "_ftlFactor", void 0),
                Wle(this, "_stlFactor", void 0),
                Wle(this, "_simulationInterval", void 0),
                Wle(this, "_planetaryMotionFactor", void 0),
                Wle(this, "_parsecLength", void 0),
                Wle(this, "_stars", void 0),
                Wle(this, "_edges", void 0),
                Wle(this, "_cyto", void 0),
                Wle(this, "_orbitMaths", void 0),
                this._ftlFactor = r.flightFTLFactor,
                this._stlFactor = r.flightSTLFactor,
                this._simulationInterval = r.simulationInterval,
                this._planetaryMotionFactor = r.planetaryMotionFactor,
                this._parsecLength = r.parsecLength,
                this._stars = t,
                this._edges = n,
                this._orbitMaths = new Ile(r.simulationInterval,r.planetaryMotionFactor),
                t && n && this._initGraph()
            }
            var t, n;
            return t = e,
            n = [{
                key: "recalculateSystemWaypoints",
                value: function(e) {
                    return e.transferEllipse ? this._orbitMaths.waypointsOnEllipse({
                        semiMajorAxis: e.transferEllipse.semiMajorAxis,
                        semiMinorAxis: e.transferEllipse.semiMinorAxis,
                        center: e.transferEllipse.center,
                        alpha: e.transferEllipse.alpha
                    }, e.transferEllipse.startPosition, e.transferEllipse.targetPosition) : null
                }
            }, {
                key: "recalculateOrbitWaypoints",
                value: function(e, t) {
                    var n = DA.orbit(e.origin);
                    return this._orbitMaths.waypointsOnOrbit(n, e.departure.timestamp / 1e3, e.arrival.timestamp / 1e3, 0, t)
                }
            }, {
                key: "recalculateTakeOffAndLandingWaypoints",
                value: function(e, t, n) {
                    return this._orbitMaths.waypointsOnOrbit(t.orbit, e.departure.timestamp / 1e3, e.arrival.timestamp / 1e3, t.mass, n)
                }
            }, {
                key: "calculateDistance",
                value: function(e, t) {
                    if (DA.isAddress(e) && DA.isAddress(t))
                        return DA.equal(e, t) ? -1 : DA.equalSystem(e, t) ? 0 : this.calculateRoute(e, t).edges.length
                }
            }, {
                key: "calculateRoute",
                value: function(e, t) {
                    var n = this
                      , r = this._cyto.elements().bellmanFord({
                        root: "#" + DA.systemId(e),
                        weight: function(e) {
                            var t = Math.floor(e.data().weight / 10);
                            return t <= 0 && console.log("weight: " + t + " for edge with id " + e.data().id),
                            t
                        },
                        directed: !1
                    }).pathTo("#" + DA.systemId(t))
                      , o = this._parsecLength
                      , i = []
                      , a = [];
                    return r.forEach((function(e) {
                        if (e.isEdge()) {
                            var t = n._findEdgeByEdgeId(e.data().id);
                            t.length = e.data().weight / o,
                            i.push(t)
                        } else
                            e.isNode() && a.push(e.data().id)
                    }
                    )),
                    {
                        edges: i,
                        systems: a
                    }
                }
            }, {
                key: "_initGraph",
                value: function() {
                    this._cyto = Lle()({
                        headless: !0,
                        renderer: {
                            name: "null"
                        }
                    });
                    var e = {
                        nodes: [],
                        edges: []
                    };
                    this._stars.forEach((function(t) {
                        e.nodes.push({
                            data: {
                                id: t.systemId,
                                name: t.name
                            }
                        })
                    }
                    )),
                    this._edges.forEach((function(t) {
                        var n = Nle.distance(t.right.position, t.left.position);
                        e.edges.push({
                            data: {
                                id: t.id,
                                source: t.left.systemId,
                                target: t.right.systemId,
                                weight: n
                            }
                        })
                    }
                    )),
                    this._cyto.load(e, null, (function() {
                        console.log("star graph initialized")
                    }
                    ))
                }
            }, {
                key: "_findEdgeByEdgeId",
                value: function(e) {
                    return this._edges.find((function(t) {
                        return t.id === e
                    }
                    ))
                }
            }],
            n && zle(t.prototype, n),
            Object.defineProperty(t, "prototype", {
                writable: !1
            }),
            e
        }()
 
 
 
 
 
 
 var Ile = function() {
            function e(t, n) {
                !function(e, t) {
                    if (!(e instanceof t))
                        throw new TypeError("Cannot call a class as a function")
                }(this, e),
                Tle(this, "_referenceTime", 1451690603),
                Tle(this, "_simulationInterval", void 0),
                Tle(this, "_planetaryMotionFactor", void 0),
                Tle(this, "_xAxis", new E8(1,0,0)),
                Tle(this, "_zAxis", new E8(0,0,1)),
                Tle(this, "_perpendicularDot", (function(e, t) {
                    return e.x * t.y - e.y * t.x
                }
                )),
                this._simulationInterval = t,
                this._planetaryMotionFactor = n
            }
            var t, n;
            return t = e,
            n = [{
                key: "estimateOrbitalPeriod",
                value: function(e, t, n) {
                    var r = e
                      , o = t;
                    return 2 * Math.PI * Math.sqrt(Math.pow(n, 3) / (667384e-19 * (r + o))) * 1e3
                }
            }, {
                key: "estimateOrbitalPeriodFromState",
                value: function(e, t, n, r) {
                    var o = Ole * (1e3 * n + r)
                      , i = -o / (2 * (t.lengthSq() / 2 - o / e.length()));
                    return 2 * Math.PI * Math.sqrt(Math.pow(i, 3) / o)
                }
            }, {
                key: "calculateOrbitFromState",
                value: function(e, t, n, r) {
                    var o = ble().position.stateToKepler([1e3 * e.y, 1e3 * e.x, 1e3 * e.z], [1e3 * t.y, 1e3 * t.x, 1e3 * t.z], n, r, 0);
                    return new Sle(o[0],o[1],o[2],o[3],o[4],o[5])
                }
            }, {
                key: "calculatePlanetStateFromOrbit",
                value: function(e, t, n, r, o, i) {
                    var a = !(arguments.length > 6 && void 0 !== arguments[6]) || arguments[6];
                    this.calculateStateFromOrbit(e, t, n, r, o, i, a)
                }
            }, {
                key: "calculateStateFromOrbit",
                value: function(e, t, n, r, o, i) {
                    var a = !(arguments.length > 6 && void 0 !== arguments[6]) || arguments[6]
                      , s = this._calculateWorldTime(r, a)
                      , l = ble().position.keplerian(n.semiMajorAxis, n.eccentricity, n.inclination, n.rightAscension, n.periapsis, s, 0, 0, o, i);
                    e.set(l[0][1] / 1e3, l[0][0] / 1e3, l[0][2] / 1e3),
                    t.set(l[1][1] / 1e3, l[1][0] / 1e3, l[1][2] / 1e3)
                }
            }, {
                key: "distanceOnOrbit",
                value: function(e, t, n, r, o) {
                    var i = !(arguments.length > 5 && void 0 !== arguments[5]) || arguments[5]
                      , a = this.waypointsOnOrbit(e, t, n, r, o, i);
                    return os().Range(0, a.length - 1).map((function(e) {
                        return a[e].distanceTo(a[e + 1])
                    }
                    )).reduce((function(e, t) {
                        return e + t
                    }
                    ), 0)
                }
            }, {
                key: "waypointsOnOrbit",
                value: function(e, t, n, r, o) {
                    for (var i = !(arguments.length > 5 && void 0 !== arguments[5]) || arguments[5], a = this.estimateOrbitalPeriod(r, o, e.semiMajorAxis / 1e3), s = n - t > a ? t + a : n, l = 0, u = 1500, c = 0; l < 10; )
                        c = a / (u *= 2),
                        l = Math.ceil((s - t) / c);
                    for (var f = [], p = 0; p < l; p++) {
                        var d = t + c * p
                          , m = new E8
                          , h = new E8;
                        this.calculateStateFromOrbit(m, h, e, d, r, o, i),
                        f.push(m)
                    }
                    return f
                }
            }, {
                key: "calculateEllipseFromPoints",
                value: function(e, t) {
                    var n = function(e) {
                        return new E8(e.x,e.y,e.z)
                    }
                      , r = new E8(0,0,0)
                      , o = new E8(e.x,e.y,0)
                      , i = new E8(t.x,t.y,0)
                      , a = n(i).sub(o)
                      , s = n(o).lerp(i, .5)
                      , l = new E8(-a.y,a.x,0)
                      , u = n(s).add(l)
                      , c = n(u).sub(s)
                      , f = n(r).sub(s)
                      , p = n(c).multiplyScalar(f.dot(c) / c.lengthSq())
                      , d = n(f).add(n(p).sub(f).multiplyScalar(2)).add(s)
                      , m = n(d).sub(r)
                      , h = Math.atan2(this._perpendicularDot(m, this._xAxis), m.dot(this._xAxis));
                    h < 0 && (h += 2 * Math.PI);
                    var y = n(r).sub(o).length()
                      , g = n(d).sub(o).length()
                      , v = (y + g) / 2
                      , A = n(r).lerp(d, .5);
                    return {
                        semiMajorAxis: v,
                        semiMinorAxis: Math.sqrt((y + g) * (y + g) - m.length() * m.length()) / 2,
                        f1: r,
                        f2: d,
                        center: A,
                        alpha: h
                    }
                }
            }, {
                key: "distanceOnEllipse",
                value: function(e, t, n) {
                    var r = new E8(t.x,t.y,0).sub(e.center).applyAxisAngle(this._zAxis, e.alpha)
                      , o = new E8(n.x,n.y,0).sub(e.center).applyAxisAngle(this._zAxis, e.alpha)
                      , i = this._findTForPointOnEllipse(e.semiMajorAxis, e.semiMinorAxis, r)
                      , a = this._findTForPointOnEllipse(e.semiMajorAxis, e.semiMinorAxis, o);
                    return this._calculateDistancesOnEllipse(i, a, e.semiMajorAxis, e.semiMinorAxis)
                }
            }, {
                key: "waypointsOnEllipse",
                value: function(e, t, n) {
                    for (var r = this.distanceOnEllipse(e, t, n), o = [], i = Math.ceil(r.tDistance / (2 * Math.PI) * 800), a = 0; a < i; a++) {
                        var s = r.tA + r.minDistanceSign * (a / 800 * 2 * Math.PI)
                          , l = this._calculateEllipseAt(new E8, s, e.semiMajorAxis, e.semiMinorAxis);
                        l.applyAxisAngle(this._zAxis, -e.alpha),
                        l.add(e.center),
                        l.setZ(a / (i - 1) * n.z + (1 - a / (i - 1)) * t.z),
                        o.push(l)
                    }
                    return o
                }
            }, {
                key: "_findTForPointOnEllipse",
                value: function(e, t, n) {
                    var r = n.x * n.x / (e * e) + n.y * n.y / (t * t);
                    if (r > 1.01)
                        return console.error("Point p(".concat(n.x, ", ").concat(n.x, ") does not lie on ellipse ").concat(e, ", ").concat(t, ", value=").concat(r)),
                        Number.NaN;
                    var o = Math.atan2(n.y / t, n.x / e);
                    return o < 0 && (o += 2 * Math.PI),
                    o >= 2 * Math.PI && (o -= 2 * Math.PI),
                    o
                }
            }, {
                key: "_calculateDistancesOnEllipse",
                value: function(e, t, n, r) {
                    var o = 3e3
                      , i = 0
                      , a = 0
                      , s = new E8(0,0,0)
                      , l = new E8(0,0,0)
                      , u = new E8(0,0,0)
                      , c = e < t ? t - e : 2 * Math.PI - (e - t)
                      , f = e > t ? e - t : 2 * Math.PI - (t - e);
                    this._calculateEllipseAt(s, e, n, r),
                    this._calculateEllipseAt(l, t, n, r);
                    for (var p = 1; p < o; p++) {
                        var d = e + p / o * c;
                        d > 2 * Math.PI && (d -= 2 * Math.PI),
                        this._calculateEllipseAt(u, d, n, r),
                        i += u.distanceTo(s),
                        s.copy(u);
                        var m = t - p / o * f;
                        m < 0 && (m += 2 * Math.PI),
                        this._calculateEllipseAt(u, m, n, r),
                        a += u.distanceTo(l),
                        l.copy(u)
                    }
                    return {
                        minDistance: Math.min(i, a),
                        minDistanceSign: i < a ? 1 : -1,
                        tA: e,
                        tB: t,
                        tDistance: i < a ? c : f
                    }
                }
            }, {
                key: "_calculateEllipseAt",
                value: function(e, t, n, r) {
                    return (t < 0 || t >= 2 * Math.PI) && console.error("t is out of band"),
                    e.set(n * Math.cos(t), r * Math.sin(t), 0),
                    e
                }
            }, {
                key: "_calculateWorldTime",
                value: function(e) {
                    var t = !(arguments.length > 1 && void 0 !== arguments[1]) || arguments[1]
                      , n = t ? this._simulationInterval / 86400 * this._planetaryMotionFactor : 1;
                    return this._referenceTime + (e - this._referenceTime) * n
                }
            }],
            n && Mle(t.prototype, n),
            Object.defineProperty(t, "prototype", {
                writable: !1
            }),
            e
        }();










        var Dle = function() {
            function e() {
                !function(e, t) {
                    if (!(e instanceof t))
                        throw new TypeError("Cannot call a class as a function")
                }(this, e),
                function(e, t, n) {
                    (t = Ble(t))in e ? Object.defineProperty(e, t, {
                        value: n,
                        enumerable: !0,
                        configurable: !0,
                        writable: !0
                    }) : e[t] = n
                }(this, "radians", Math.PI / 180)
            }
            var t, n;
            return t = e,
            n = [{
                key: "clamp",
                value: function(e, t, n) {
                    return Math.min(Math.max(e, t), n)
                }
            }, {
                key: "convertToSpherical",
                value: function(e) {
                    var t = Math.sqrt(e[0] * e[0] + e[1] * e[1])
                      , n = Math.atan2(e[2], t);
                    return [Math.atan2(e[1], e[0]) / this.radians, n / this.radians]
                }
            }, {
                key: "convertToCartesian",
                value: function(e) {
                    var t = e[0] * this.radians
                      , n = e[1] * this.radians
                      , r = Math.cos(n);
                    return [r * Math.cos(t), r * Math.sin(t), Math.sin(n)]
                }
            }, {
                key: "distance",
                value: function(e, t) {
                    return Math.sqrt(this.distanceSquared(e, t))
                }
            }, {
                key: "distanceSquared",
                value: function(e, t) {
                    var n = t.x - e.x
                      , r = t.y - e.y
                      , o = t.z - e.z;
                    return n * n + r * r + o * o
                }
            }, {
                key: "evaluatePDF",
                value: function(e, t) {
                    for (var n = t(), r = e.reduce((function(e, t) {
                        return e + t[0]
                    }
                    ), 0), o = 0, i = 0; i < e.length; i++)
                        if (n < (o += e[i][0]) / r)
                            return e[i][1];
                    console.log("this should never ever happen!")
                }
            }],
            n && jle(t.prototype, n),
            Object.defineProperty(t, "prototype", {
                writable: !1
            }),
            e
        }()
          , Nle = new Dle